// Socket.IO Server - Real-time communication for CardVerse
// Per ARCHITECTURE.md Section 7

import { Server as HttpServer } from 'http';

import { Server as SocketServer, Socket } from 'socket.io';

import { engineService } from '../engine/engine.service';
import { sessionManager } from '../engine/session/session.manager';
import { turnManager } from '../engine/turn/turn.manager';
import { TurnPhase } from '../engine/turn/turn.types';
import { disconnectManager } from '../engine/disconnect/disconnect.manager';
import { lobbyManager } from '../engine/lobby/lobby.manager';
import { matchmakingIntegration } from '../modules/matchmaking-integration/matchmaking-integration.service';

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
  declare_hokm: (data: { matchId: string; playerId: string; mode: string; suit?: string }) => void;

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

export class SocketManager {
  private io: SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private matchRooms: Map<string, Set<string>> = new Map(); // matchId -> set of socketIds

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
      path: '/socket.io',
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('[SocketManager] Socket.IO server initialized');
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Authentication required'));
      }
      socket.data.userId = userId;
      next();
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
        socket.on('join_match', (data) => {
          this.handleJoinMatch(socket, data);
        });

        // Handle leaving a match room
        socket.on('leave_match', (data) => {
          this.handleLeaveMatch(socket, data);
        });

        // Handle match creation
        socket.on('create_match', (data) => {
          this.handleCreateMatch(socket, data);
        });

        // Handle match start
        socket.on('start_match', (data) => {
          this.handleStartMatch(socket, data);
        });

        // Handle card play
        socket.on('play_card', (data) => {
          this.handlePlayCard(socket, data);
        });

        // Handle Hokm declaration
        socket.on('declare_hokm', (data) => {
          this.handleDeclareHokm(socket, data);
        });

        // Handle ready status
        socket.on('set_ready', (data) => {
          this.handleSetReady(socket, data);
        });

        // Handle chat
        socket.on('send_chat', (data) => {
          this.handleChat(socket, data);
        });

        // Handle reconnect
        socket.on('reconnect', (data) => {
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

    const room = matchId.startsWith('match_') ? matchId : `match_${matchId}`;
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

    socket.leave(`match_${matchId}`);
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
      // Create match via engine service
      const matchId = `match_${Date.now()}`;
      const matchState = engineService.createMatch(matchId, data.players, data.config);

      // Create lobby
      lobbyManager.createLobby(matchId, matchId, data.players[0].id, data.players[0].username);

      // Add players to lobby
      for (const player of data.players) {
        lobbyManager.addPlayer(matchId, player);
      }

      // Join match room
      socket.join(`match_${matchId}`);
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
        players: data.players,
      });

      // Broadcast to all in room
      this.io.to(`match_${matchId}`).emit('match_updated', {
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

      // Deal cards
      engineService.dealCards(matchId);

      // Broadcast match started
      this.io.to(`match_${matchId}`).emit('match_started', {
        matchId,
        config: matchState?.config,
      });

      // Start first turn
      this.startTurn(matchId);

      console.log(`[SocketManager] Match ${matchId} started`);
    } catch (error) {
      socket.emit('error', {
        code: 'MATCH_START_ERROR',
        message: error instanceof Error ? error.message : 'Failed to start match',
      });
    }
  }

  private handlePlayCard(
    socket: Socket,
    data: { matchId: string; playerId: string; cardId: string }
  ): void {
    try {
      const { matchId, playerId, cardId } = data;

      // Play card via engine service
      const matchState = engineService.playCard(matchId, playerId, cardId);

      // Reset consecutive misses for this player
      if (matchState) {
        turnManager.resetConsecutiveMisses(matchId, playerId, matchState);
      }

      // Broadcast card played
      this.io.to(`match_${matchId}`).emit('card_played', {
        playerId,
        cardId,
        trick: matchState?.tricks[matchState?.currentTrickIndex - 1],
      });

      // Broadcast updated state
      this.io.to(`match_${matchId}`).emit('match_updated', {
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

  private handleDeclareHokm(
    socket: Socket,
    data: { matchId: string; playerId: string; mode: string; suit?: string }
  ): void {
    try {
      const { matchId, playerId, mode, suit } = data;

      // Update match config with Hokm declaration
      const matchState = engineService.getMatchState(matchId);
      if (matchState) {
        matchState.config.mode = mode as any;
        if (suit) {
          matchState.config.trumpSuit = suit as any;
        }
      }

      // Broadcast Hokm declared
      this.io.to(`match_${matchId}`).emit('match_updated', {
        matchId,
        state: matchState,
      });

      console.log(`[SocketManager] Player ${playerId} declared Hokm: ${mode} ${suit || ''}`);
    } catch (error) {
      socket.emit('error', {
        code: 'DECLARE_HOKM_ERROR',
        message: error instanceof Error ? error.message : 'Failed to declare Hokm',
      });
    }
  }

  private handleSetReady(socket: Socket, data: { matchId: string; playerId: string; isReady: boolean }): void {
  try {
    const { matchId, playerId, isReady } = data;

    console.log(`[SocketManager] handleSetReady match=${matchId} player=${playerId} isReady=${isReady}`);

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

    this.io.to(`match_${matchId}`).emit('chat_message', {
      from: playerId,
      message,
      timestamp: new Date(),
    });
  }

  private handleReconnect(socket: Socket, data: { matchId: string; playerId: string }): void {
    try {
      const { matchId, playerId } = data;

      const success = sessionManager.handlePlayerReconnect(matchId, playerId);
      if (success) {
        // Join match room again
        socket.join(`match_${matchId}`);
        socket.data.matchId = matchId;
        socket.data.playerId = playerId;

        // Track socket
        if (!this.matchRooms.has(matchId)) {
          this.matchRooms.set(matchId, new Set());
        }
        this.matchRooms.get(matchId)!.add(socket.id);

        // Broadcast reconnect
        this.io.to(`match_${matchId}`).emit('player_reconnected', {
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
        disconnectManager.recordMiss(matchId, playerId, matchState);
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
      this.io.to(`match_${matchId}`).emit('match_updated', {
        matchId,
        state: engineService.getMatchState(matchId),
      });

      console.log(`[SocketManager] Client ${socket.id} disconnected from match ${matchId}`);
    }
  }

  private startTurn(matchId: string): void {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

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
    this.io.to(`match_${matchId}`).emit('turn_started', {
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
    const room = matchId.startsWith('match_') ? matchId : `match_${matchId}`;
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
