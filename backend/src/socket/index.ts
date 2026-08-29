// Socket.IO Server - Real-time communication for CardVerse
// Per ARCHITECTURE.md Section 7
// S12 - Game Integrity Audit: Full State Machine + Declaration Phase

import { Server as HttpServer } from 'http';

import { Server as SocketServer, Socket } from 'socket.io';

import { engineService } from '../engine/engine.service.js';
import { sessionManager } from '../engine/session/session.manager.js';
import { turnManager } from '../engine/turn/turn.manager.js';
import { TurnPhase } from '../engine/turn/turn.types.js';
import { disconnectManager } from '../engine/disconnect/disconnect.manager.js';
import { lobbyManager } from '../engine/lobby/lobby.manager.js';
import { matchmakingIntegration } from '../modules/matchmaking-integration/matchmaking-integration.service.js';
import { verifyToken } from '../auth/jwt.service.js';
import { EngineStatus, GameMode, Suit } from '../engine/engine.types.js';

// Socket.IO event types
export interface ServerToClientEvents {
  // Match events
  match_created: (data: { matchId: string; players: any[] }) => void;
  match_started: (data: { matchId: string; config: any }) => void;
  match_started_ack: (data: { matchId: string; config: any }) => void;
  match_updated: (data: { matchId: string; state: any }) => void;
  match_completed: (data: { matchId: string; result: any }) => void;

  // Turn events
  turn_started: (data: { playerId: string; timeoutMs: number }) => void;
  turn_timeout: (data: { playerId: string; consecutiveMisses: number }) => void;
  card_played: (data: { playerId: string; cardId: string; trick: any }) => void;

  // 🆕 S12 - Declaration events
  declaration_started: (data: { hakemId: string; timeoutMs: number }) => void;
  declaration_completed: (data: { mode: string; trumpSuit?: string }) => void;

  // Disconnect events
  player_auto_kicked: (data: { playerId: string; message: string }) => void;
  player_reconnected: (data: { playerId: string }) => void;

  // Chat events
  chat_message: (data: { from: string; message: string; timestamp: Date }) => void;

  // Error events
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  // Match events
  create_match: (data: { players: any[]; config: any }) => void;
  start_match: (data: { matchId: string }) => void;
  join_match: (data: { matchId: string; playerId: string }) => void;
  leave_match: (data: { matchId: string; playerId: string }) => void;

  // Turn events
  play_card: (data: { matchId: string; playerId: string; cardId: string }) => void;

  // 🆕 S12 - Declaration events (using GameMode and Suit enums)
  declare_hokm: (data: { matchId: string; playerId: string; mode: GameMode; suit?: Suit }) => void;

  // Ready events
  set_ready: (data: { matchId: string; playerId: string; isReady: boolean }) => void;

  // Chat events
  send_chat: (data: { matchId: string; playerId: string; message: string }) => void;

  // Disconnect events
  reconnect: (data: { matchId: string; playerId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  playerId?: string;
  matchId?: string;
}

/**
 * Socket.IO authentication uses JWT tokens verified via verifyToken().
 * All connections must provide a valid JWT token in the handshake auth.
 */

export class SocketManager {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private matchRooms: Map<string, Set<string>> = new Map(); // matchId -> set of socketIds

  /**
   * Returns the consistent socket.io room name for a match.
   *
   * Match ids already carry the `match_` prefix (e.g. `match_1787259902211_e2e-test`),
   * so using `match_${matchId}` directly would broadcast a DOUBLE prefix
   * (`match_match_...`) that silently breaks every emit: clients join the
   * single-prefix room while events are delivered into an empty double-prefix room.
   */
  private roomName(matchId: string): string {
    return matchId.startsWith('match_') ? matchId : `match_${matchId}`;
  }

  /**
   * SECURITY (Server-Authoritative): rejects any event where the client-supplied
   * `playerId` does not match the authenticated userId bound to this socket.
   * This is what stops one tab/user from acting as another player.
   */
  private assertPlayerOwnership(socket: Socket, playerId: string): void {
    const authUserId = socket.data.userId;
    if (!authUserId || authUserId !== playerId) {
      throw new Error(`Forbidden: playerId '${playerId}' does not match authenticated user`);
    }
  }

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
      path: '/socket.io',
    });

    // Authentication middleware - requires valid JWT token via handshake.auth.token.
    // No backdoor: direct userId is NOT accepted.
    // All clients must provide a valid JWT token.

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('[SocketManager] Socket.IO server initialized');
  }

  private setupMiddleware(): void {
    // Authentication middleware - only accepts valid JWT tokens
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      // 🔍 لاگ دقیق از آنچه واقعاً می‌رسد
      console.log(
        '[Socket Auth] Full handshake.auth:',
        JSON.stringify(socket.handshake.auth, null, 2)
      );
      console.log('[Socket Auth] Token value:', socket.handshake.auth.token);
      console.log('[Socket Auth] Token type:', typeof socket.handshake.auth.token);

      const token = socket.handshake.auth.token;

      if (!token || typeof token !== 'string') {
        return next(new Error('Authentication failed: No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication failed: Invalid token'));
      }

      // verifyToken returns { userId: string } — bind the STRING userId to the socket.
      socket.data.userId = decoded.userId;

      // SECURITY: enforce ONE live socket per userId — if this user already has an
      // established connection, disconnect the old one (multi-tab / multi-device).
      const existingSockets = this.io.sockets.sockets;
      for (const [, other] of existingSockets) {
        if (other.id !== socket.id && other.data?.userId === decoded.userId && other.connected) {
          console.warn(
            `[SocketManager] Duplicate connection for user ${decoded.userId}; disconnecting old socket ${other.id}`
          );
          other.emit('error', {
            code: 'DUPLICATE_CONNECTION',
            message: 'Connected from another tab/device',
          });
          other.disconnect(true);
        }
      }

      return next();
    });
  }

  private setupEventHandlers(): void {
    this.io.on(
      'connection',
      (
        socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
      ) => {
        console.log(
          `[SocketManager] Client connected: ${socket.id}, userId: ${socket.data.userId}`
        );

        // Handle joining a match room
        socket.on('join_match', (data: { matchId: string; playerId: string }) => {
          this.handleJoinMatch(socket, data);
        });

        // Handle leaving a match room
        socket.on('leave_match', (data: { matchId: string; playerId: string }) => {
          this.handleLeaveMatch(socket, data);
        });

        // Handle match creation
        socket.on('create_match', (data: { players: any[]; config: any }) => {
          this.handleCreateMatch(socket, data);
        });

        // Handle match start
        socket.on('start_match', (data: { matchId: string }) => {
          this.handleStartMatch(socket, data);
        });

        // Handle card play
        socket.on('play_card', (data: { matchId: string; playerId: string; cardId: string }) => {
          this.handlePlayCard(socket, data);
        });

        // 🆕 S12 - Handle Hokm declaration using engineService.declareHokm
        socket.on(
          'declare_hokm',
          (data: { matchId: string; playerId: string; mode: GameMode; suit?: Suit }) => {
            this.handleDeclareHokm(socket, data);
          }
        );

        // Handle ready status
        socket.on('set_ready', (data: { matchId: string; playerId: string; isReady: boolean }) => {
          this.handleSetReady(socket, data);
        });

        // Handle chat
        socket.on('send_chat', (data: { matchId: string; playerId: string; message: string }) => {
          this.handleChat(socket, data);
        });

        // Handle reconnect
        socket.on('reconnect', (data: { matchId: string; playerId: string }) => {
          this.handleReconnect(socket, data);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
          this.handleDisconnect(socket);
        });
      }
    );
  }

  private handleJoinMatch(socket: Socket, data: { matchId: string; playerId: string }): void {
    const { matchId, playerId } = data;

    try {
      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);
    } catch (error) {
      socket.emit('error', {
        code: 'FORBIDDEN',
        message: error instanceof Error ? error.message : 'Forbidden',
      });
      return;
    }

    const room = this.roomName(matchId);
    socket.join(room);
    console.log(`[SocketManager] Player ${playerId} joined room ${room}`);

    socket.data.matchId = matchId;
    socket.data.playerId = playerId;

    // Track socket in match
    if (!this.matchRooms.has(matchId)) {
      this.matchRooms.set(matchId, new Set());
    }
    this.matchRooms.get(matchId)!.add(socket.id);

    // Send current match state to the player
    const matchState = engineService.getMatchState(matchId);
    if (matchState) {
      socket.emit('match_updated', {
        matchId,
        state: matchState,
      });
    }

    console.log(`[SocketManager] Player ${playerId} joined match ${matchId}`);
  }

  private handleLeaveMatch(socket: Socket, data: { matchId: string; playerId: string }): void {
    const { matchId, playerId } = data;

    try {
      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);
    } catch (error) {
      socket.emit('error', {
        code: 'FORBIDDEN',
        message: error instanceof Error ? error.message : 'Forbidden',
      });
      return;
    }

    socket.leave(this.roomName(matchId));
    socket.data.matchId = undefined;
    socket.data.playerId = undefined;

    // Remove socket from match tracking
    const room = this.matchRooms.get(matchId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.matchRooms.delete(matchId);
      }
    }

    console.log(`[SocketManager] Player ${playerId} left match ${matchId}`);
  }

  private handleCreateMatch(socket: Socket, data: { players: any[]; config: any }): void {
    try {
      // SECURITY (Server-Authoritative): the creator must be the first player,
      // and no player may already be bound to an active match.
      const creatorUserId = socket.data.userId;
      if (!creatorUserId || data.players[0]?.id !== creatorUserId) {
        throw new Error('Match creator must be the first player');
      }
      for (const player of data.players) {
        if (sessionManager.getActiveMatchForUser(player.id)) {
          throw new Error(`Player ${player.id} is already in an active match`);
        }
      }

      const matchId = `match_${Date.now()}`;

      // Create the lobby FIRST, then add the real players, then fill any
      // remaining seats with invisible bots so the engine has exactly 4 seats.
      // NOTE: createLobby already adds the HOST (players:[host]) to the lobby,
      // so we must NOT re-add data.players[0] — it would duplicate the host.
      lobbyManager.createLobby(matchId, matchId, data.players[0].id, data.players[0].username);
      for (let i = 1; i < data.players.length; i++) {
        lobbyManager.addPlayer(matchId, data.players[i]);
      }

      // RULEBOOK §13: if fewer than 4 humans are present, immediately fill the
      // empty seats with invisible bots so `engineService.createMatch` (which
      // requires exactly 4 players) does not throw "Hokm requires exactly 4 players".
      matchmakingIntegration.fillLobbyWithBots(matchId);

      // Build the final 4-player roster from the lobby (humans + created bots).
      const lobby = lobbyManager.getLobbyByMatch(matchId);
      if (!lobby) {
        throw new Error('Failed to find lobby for new match');
      }
      const fullPlayers = lobby.players.map((p, index) => ({
        id: p.id,
        userId: p.userId,
        // GUARANTEE: username is always a non-empty string (Player invariant).
        username: p.username || `Player ${index + 1}`,
        seatIndex: p.seatIndex,
        teamId: p.teamId,
        isActive: p.isActive !== false,
        isBot: p.isBot === true,
      }));

      // Create match via engine service (needs exactly 4 players).
      const matchState = engineService.createMatch(matchId, fullPlayers, data.config);

      // If somehow still not full, schedule bot-fill for later so the match can
      // complete its roster per RULEBOOK §13.
      if (!lobbyManager.isLobbyFull(lobby)) {
        lobbyManager.scheduleBotFill(
          matchId,
          matchmakingIntegration.getConfig().defaultReadyTimeoutMs || 30000
        );
      }

      // Join match room
      socket.join(this.roomName(matchId));
      socket.data.matchId = matchId;
      socket.data.playerId = data.players[0].id;

      // Track socket
      if (!this.matchRooms.has(matchId)) {
        this.matchRooms.set(matchId, new Set());
      }
      this.matchRooms.get(matchId)!.add(socket.id);

      // Emit match created event
      socket.emit('match_created', {
        matchId,
        players: fullPlayers,
      });

      // Broadcast to all in room
      this.io.to(this.roomName(matchId)).emit('match_updated', {
        matchId,
        state: matchState,
      });

      console.log(`[SocketManager] Match ${matchId} created by player ${data.players[0].id}`);
    } catch (error) {
      socket.emit('error', {
        code: 'MATCH_CREATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create match',
      });
    }
  }

  private handleStartMatch(socket: Socket, data: { matchId: string }): void {
    try {
      const { matchId } = data;

      // Start the match
      const matchState = engineService.startMatch(matchId);

      // Start session
      sessionManager.startSession(matchId);

      // 🆕 S12 - Deal cards (moves to DECLARATION phase)
      engineService.dealCards(matchId);

      // Broadcast match started
      this.io.to(this.roomName(matchId)).emit('match_started', {
        matchId,
        config: matchState?.config,
      });

      // 🆕 S12 - Start declaration phase (not turn)
      this.startDeclarationPhase(matchId);

      console.log(`[SocketManager] Match ${matchId} started - DECLARATION phase`);
    } catch (error) {
      socket.emit('error', {
        code: 'MATCH_START_ERROR',
        message: error instanceof Error ? error.message : 'Failed to start match',
      });
    }
  }

  // 🆕 S12 - Start declaration phase
  public startDeclarationPhase(matchId: string): void {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

    const hakemId = matchState.hakemId;
    if (!hakemId) {
      console.error(`[SocketManager] No Hakem found for match ${matchId}`);
      return;
    }

    // Update match state to DECLARATION
    matchState.status = EngineStatus.DECLARATION;
    matchState.currentPhaseStartTime = new Date();

    // Broadcast declaration started
    this.io.to(this.roomName(matchId)).emit('declaration_started', {
      hakemId,
      timeoutMs: matchState.config.declarationTimeoutMs || 20000,
    });

    // Broadcast updated state
    this.io.to(this.roomName(matchId)).emit('match_updated', {
      matchId,
      state: matchState,
    });

    console.log(
      `[SocketManager] Declaration phase started for match ${matchId}, Hakem: ${hakemId}`
    );

    // 🆕 If the Hakem is a BOT, it must declare Hokm automatically so the match
    // can leave DECLARATION and enter PLAYING. A bot Hakem has no human client
    // to send `declare_hokm` from the Lobby/Game UI.
    const hakem = matchState.players.find((p) => p.id === hakemId);
    if (hakem?.isBot) {
      console.log(
        `[SocketManager] Hakem ${hakemId} is a bot; auto-declaring Hokm (RULEBOOK §13.4)`
      );
      try {
        const declared = engineService.autoDeclareHokm(matchId);
        // Broadcast the resulting declaration + state so all clients sync.
        this.io.to(this.roomName(matchId)).emit('declaration_completed', {
          mode: declared.config.mode,
          trumpSuit: declared.config.trumpSuit,
        });
        this.io.to(this.roomName(matchId)).emit('match_updated', {
          matchId,
          state: declared,
        });
        // The bot Hakem now leads the first trick naturally (botPlayCard →
        // playCard → startTurn continues the flow for subsequent players).
        matchmakingIntegration.makeBotPlay(matchId, hakemId);
      } catch (error) {
        console.error(`[SocketManager] Bot auto-declare failed for match ${matchId}:`, error);
      }
    }
  }

  private handlePlayCard(
    socket: Socket,
    data: { matchId: string; playerId: string; cardId: string }
  ): void {
    try {
      const { matchId, playerId, cardId } = data;

      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);

      // Play card via engine service
      const matchState = engineService.playCard(matchId, playerId, cardId);

      // Reset consecutive misses for this player
      if (matchState) {
        turnManager.resetConsecutiveMisses(matchId, playerId, matchState);
      }

      // Broadcast card played
      this.io.to(this.roomName(matchId)).emit('card_played', {
        playerId,
        cardId,
        trick: matchState?.tricks[matchState?.currentTrickIndex - 1],
      });

      // Broadcast updated state
      this.io.to(this.roomName(matchId)).emit('match_updated', {
        matchId,
        state: matchState,
      });

      // Start next turn
      this.startTurn(matchId);

      console.log(`[SocketManager] Player ${playerId} played card ${cardId} in match ${matchId}`);
    } catch (error) {
      socket.emit('error', {
        code: 'PLAY_CARD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to play card',
      });
    }
  }

  // 🆕 S12 - Handle Hokm declaration using engineService.declareHokm
  private handleDeclareHokm(
    socket: Socket,
    data: { matchId: string; playerId: string; mode: GameMode; suit?: Suit }
  ): void {
    try {
      const { matchId, playerId, mode, suit } = data;

      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);

      console.log(
        `[SocketManager] handleDeclareHokm: match=${matchId}, player=${playerId}, mode=${mode}, suit=${suit}`
      );

      // 🆕 Use engineService.declareHokm (S12)
      const matchState = engineService.declareHokm(matchId, playerId, mode, suit);

      // Broadcast declaration completed
      this.io.to(this.roomName(matchId)).emit('declaration_completed', {
        mode,
        trumpSuit: suit,
      });

      // Broadcast updated state
      this.io.to(this.roomName(matchId)).emit('match_updated', {
        matchId,
        state: matchState,
      });

      // 🆕 Start first turn - Hakem leads (RULEBOOK §6.1)
      // engineService.declareHokm sets currentPlayerId = hakem; we must NOT
      // advance to the next player here, so emit turn_started directly to Hakem.
      const firstPlayerId = matchState?.currentPlayerId ?? matchState?.hakemId;
      if (firstPlayerId && matchState) {
        this.io.to(this.roomName(matchId)).emit('turn_started', {
          playerId: firstPlayerId,
          timeoutMs: matchState.config.turnTimeoutMs || 8000,
        });
      }

      console.log(`[SocketManager] Player ${playerId} declared Hokm: ${mode} ${suit || ''}`);
    } catch (error) {
      socket.emit('error', {
        code: 'DECLARE_HOKM_ERROR',
        message: error instanceof Error ? error.message : 'Failed to declare Hokm',
      });
    }
  }

  private handleSetReady(
    socket: Socket,
    data: { matchId: string; playerId: string; isReady: boolean }
  ): void {
    try {
      const { matchId, playerId, isReady } = data;

      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);

      console.log(
        `[SocketManager] handleSetReady match=${matchId} player=${playerId} isReady=${isReady}`
      );

      // Use matchmakingIntegration to handle ready status
      const success = matchmakingIntegration.setPlayerReady(matchId, playerId, isReady);

      if (!success) {
        throw new Error('Failed to set ready status');
      }

      // Broadcast ready status update
      this.broadcastToMatch(matchId, 'match_updated', {
        matchId,
        state: engineService.getMatchState(matchId),
      });

      console.log(`[SocketManager] Player ${playerId} ready: ${isReady} in match ${matchId}`);
    } catch (error) {
      socket.emit('error', {
        code: 'SET_READY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to set ready status',
      });
    }
  }

  private handleChat(
    _socket: Socket,
    data: { matchId: string; playerId: string; message: string }
  ): void {
    const { matchId, playerId, message } = data;

    this.io.to(this.roomName(matchId)).emit('chat_message', {
      from: playerId,
      message,
      timestamp: new Date(),
    });
  }

  private handleReconnect(socket: Socket, data: { matchId: string; playerId: string }): void {
    try {
      const { matchId, playerId } = data;

      // SECURITY: client must act only as its authenticated self.
      this.assertPlayerOwnership(socket, playerId);

      const success = sessionManager.handlePlayerReconnect(matchId, playerId);
      if (success) {
        // Join match room again
        socket.join(this.roomName(matchId));
        socket.data.matchId = matchId;
        socket.data.playerId = playerId;

        // Track socket
        if (!this.matchRooms.has(matchId)) {
          this.matchRooms.set(matchId, new Set());
        }
        this.matchRooms.get(matchId)!.add(socket.id);

        // Broadcast reconnect
        this.io.to(this.roomName(matchId)).emit('player_reconnected', {
          playerId,
        });

        // Send current state
        const matchState = engineService.getMatchState(matchId);
        if (matchState) {
          socket.emit('match_updated', {
            matchId,
            state: matchState,
          });
        }

        console.log(`[SocketManager] Player ${playerId} reconnected to match ${matchId}`);
      } else {
        socket.emit('error', {
          code: 'RECONNECT_ERROR',
          message: 'Reconnection failed - match not found or reconnection window expired',
        });
      }
    } catch (error) {
      socket.emit('error', {
        code: 'RECONNECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to reconnect',
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    const matchId = socket.data.matchId;
    const playerId = socket.data.playerId;

    if (matchId && playerId) {
      // Notify disconnect manager
      const matchState = engineService.getMatchState(matchId);
      if (matchState) {
        // Record a miss AND immediately mark the disconnected player as
        // inactive. This satisfies the E2E flow: a real socket disconnect
        // removes the player from the active game (RULEBOOK §12), while
        // autoKickPlayer also registers the kick so `reconnect` (test 7)
        // can restore the same player afterwards.
        disconnectManager.recordMiss(matchId, playerId, matchState);
        disconnectManager.autoKickPlayer(matchId, playerId, matchState);
      }

      // Remove from match room tracking
      const room = this.matchRooms.get(matchId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          this.matchRooms.delete(matchId);
        }
      }

      // Broadcast to other players
      this.io.to(this.roomName(matchId)).emit('match_updated', {
        matchId,
        state: engineService.getMatchState(matchId),
      });

      console.log(`[SocketManager] Client ${socket.id} disconnected from match ${matchId}`);
    }
  }

  private startTurn(matchId: string): void {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

    // Only start turn if in PLAYING state
    if (matchState.status !== EngineStatus.PLAYING) {
      console.log(
        `[SocketManager] Cannot start turn - match ${matchId} is in ${matchState.status}`
      );
      return;
    }

    // Find next player
    const currentPlayerId = matchState.currentPlayerId;
    const players = matchState.players.filter((p) => p.isActive);

    let nextPlayerId: string | undefined;
    if (!currentPlayerId) {
      // First turn - start with Hakem
      nextPlayerId = matchState.hakemId;
    } else {
      // Find next in counter-clockwise order
      const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
      const nextIndex = (currentIndex + 1) % players.length;
      nextPlayerId = players[nextIndex]?.id;
    }

    if (!nextPlayerId) return;

    // Start turn
    const turnInfo = turnManager.startTurn(matchId, nextPlayerId, TurnPhase.PLAYING, matchState);

    // Broadcast turn started
    this.io.to(this.roomName(matchId)).emit('turn_started', {
      playerId: nextPlayerId,
      timeoutMs: turnInfo.timeoutMs,
    });

    // Update match state
    matchState.currentPlayerId = nextPlayerId;
  }

  /**
   * Broadcasts a message to all clients in a match room
   */
  public broadcastToMatch(matchId: string, event: keyof ServerToClientEvents, data: any): void {
    const room = this.roomName(matchId);
    console.log(`[SocketManager] Broadcasting to room ${room}, event: ${event}`);
    this.io.to(room).emit(event, data);
  }

  /**
   * Sends a message to a specific client
   */
  public sendToClient(socketId: string, event: keyof ServerToClientEvents, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Gets the Socket.IO server instance
   */
  public getIO(): SocketServer {
    return this.io;
  }

  /**
   * Closes the Socket.IO server
   */
  public close(): void {
    this.io.close();
    console.log('[SocketManager] Socket.IO server closed');
  }
}

let socketManagerInstance: SocketManager | null = null;

/**
 * Initialize Socket.IO with HTTP server
 */
export function initSocketIO(server: HttpServer): SocketManager {
  if (!socketManagerInstance) {
    socketManagerInstance = new SocketManager(server);
  }
  return socketManagerInstance;
}

/**
 * Get the Socket.IO manager instance
 */
export function getSocketManager(): SocketManager | null {
  return socketManagerInstance;
}

/**
 * Close Socket.IO connection
 */
export function closeSocketIO(): void {
  if (socketManagerInstance) {
    socketManagerInstance.close();
    socketManagerInstance = null;
  }
}
