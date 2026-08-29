/**
 * Matchmaking Integration Service
 *
 * Connects Matchmaking Foundation with Engine Layer
 * Per ARCHITECTURE.md Section 3.2 and DASHBOARD.md Task 7.0
 */

import { GameMode as MatchmakingGameMode } from '../matchmaking/matchmaking.types.js';
import {
  GameMode as EngineGameMode,
  Player,
  MatchConfig,
  Suit,
} from '../../engine/engine.types.js';
import { engineService } from '../../engine/engine.service.js';
import { lobbyManager } from '../../engine/lobby/lobby.manager.js';
import { roomManager } from '../../engine/room/room.manager.js';
import { sessionManager } from '../../engine/session/session.manager.js';
import { botManager } from '../../game/bot/bot.manager.js';
import { turnManager } from '../../engine/turn/turn.manager.js';
import { TurnPhase } from '../../engine/turn/turn.types.js';
import { disconnectManager } from '../../engine/disconnect/disconnect.manager.js';
import { getSocketManager } from '../../socket/index.js';

import {
  MatchmakingMatchRequest,
  MatchCreationResult,
  MatchmakingIntegrationConfig,
  MatchStatisticsRecord,
} from './matchmaking-integration.types.js';

export class MatchmakingIntegrationService {
  private config: MatchmakingIntegrationConfig;
  private matchPlayerMap: Map<string, string[]> = new Map(); // matchId -> userIds

  constructor(config: MatchmakingIntegrationConfig) {
    this.config = config;

    lobbyManager.onLobbyStart((matchId: string) => {
      console.log(`[MatchmakingIntegration] Lobby ${matchId} started; launching match`);
      this.startMatch(matchId);
    });

    // Wire bot-fill: when a lobby isn't full after timeout, fill remaining seats
    // with invisible bots so the match can start (per RULEBOOK §13).
    lobbyManager.onRequestBotFill((matchId: string) => {
      this.fillLobbyWithBots(matchId);
    });
  }

  /**
   * Fills a lobby's empty seats with invisible bots so the match can start
   * even when fewer than 4 humans are present (RULEBOOK §13 — bot scenarios).
   * Bots inherit the team/seat of the seat they fill and are NOT marked visually.
   */
  fillLobbyWithBots(matchId: string): void {
    const lobby = lobbyManager.getLobbyByMatch(matchId);
    if (!lobby || lobby.status !== 'waiting') return;
    if (!this.config.botReplacementEnabled) return;
    if (lobbyManager.isLobbyFull(lobby)) return;

    const usedSeats = new Set(lobby.players.map((p) => p.seatIndex));
    const maxPlayers = 4; // Hokm fixed 4 seats
    for (let seat = 0; seat < maxPlayers; seat++) {
      if (lobby.players.length >= maxPlayers) break;
      if (usedSeats.has(seat)) continue;

      const botUsername = `Player${seat + 1}`;
      const botId = `bot_${matchId}_${seat}`;
      const bot: Player = {
        id: botId,
        userId: botId,
        username: botUsername,
        seatIndex: seat,
        teamId: seat % 2 === 0 ? 0 : 1,
        isActive: true,
        isBot: true,
        consecutiveMisses: 0,
      };

      lobbyManager.addPlayer(matchId, bot);
      usedSeats.add(seat);
      // Bots are always ready (RULEBOOK §13): they must not block the match
      // from starting when every human is ready.
      lobbyManager.setPlayerReady(matchId, botId, true);
      console.log(
        `[MatchmakingIntegration] Bot ${botId} added to lobby ${matchId} (seat ${seat}), ready`
      );
    }
  }

  /**
   * Creates a match from a matchmaking queue entry
   * Connects Matchmaking Foundation to Engine Layer
   */
  createMatchFromQueue(request: MatchmakingMatchRequest): MatchCreationResult {
    try {
      const { queueEntryId, players, gameMode } = request;

      // Validate: exactly 4 players required for Hokm
      if (players.length !== 4) {
        return {
          matchId: '',
          success: false,
          error: 'Hokm requires exactly 4 players',
        };
      }

      // SECURITY: reject match creation if any player is already in an active match
      // (prevents one user from joining two matches simultaneously / multi-tab stuffing).
      for (const player of players) {
        if (sessionManager.getActiveMatchForUser(player.userId)) {
          return {
            matchId: '',
            success: false,
            error: `Player ${player.userId} is already in an active match`,
          };
        }
      }

      // SECURITY: reject duplicate userIds within the SAME match request
      // (prevents one user from filling multiple seats of the same match).
      const uniqueIds = new Set(players.map((p) => p.userId));
      if (uniqueIds.size !== players.length) {
        return {
          matchId: '',
          success: false,
          error: 'Duplicate player detected in match request',
        };
      }

      // Map game mode from Matchmaking to Engine
      const engineGameMode = this.mapGameMode(gameMode);

      // Create players for Engine
      const enginePlayers: Player[] = players.map((player, index) => ({
        id: player.userId,
        userId: player.userId,
        username: player.username,
        seatIndex: index,
        teamId: index % 2 === 0 ? 0 : 1, // Seats 0&2 = Team 0, Seats 1&3 = Team 1
        isActive: true,
        isBot: false,
        consecutiveMisses: 0,
      }));

      // Create match config
      const matchConfig: MatchConfig = {
        mode: engineGameMode,
        totalSetsToWin: this.config.defaultTotalSetsToWin,
        turnTimeoutMs: this.config.defaultTurnTimeoutMs,
        declarationTimeoutMs: this.config.defaultDeclarationTimeoutMs,
      };

      // Create match ID
      const matchId = `match_${Date.now()}_${queueEntryId}`;

      // Create match via Engine Service
      const matchState = engineService.createMatch(matchId, enginePlayers, matchConfig);

      // Create session for this match (required for lifecycle + reconnection)
      sessionManager.createSession(matchId, enginePlayers, matchConfig);

      // Create lobby (host is the first player)
      lobbyManager.createLobby(matchId, matchId, enginePlayers[0].id, enginePlayers[0].username);

      // Add remaining players to lobby (skip the host)
      for (let i = 1; i < enginePlayers.length; i++) {
        lobbyManager.addPlayer(matchId, enginePlayers[i]);
      }

      // If the lobby isn't full (fewer than 4 humans), schedule a bot-fill
      // after the ready-timeout so the match can still start (RULEBOOK §13).
      const lobby = lobbyManager.getLobbyByMatch(matchId);
      if (lobby && !lobbyManager.isLobbyFull(lobby)) {
        lobbyManager.scheduleBotFill(matchId, this.config.defaultReadyTimeoutMs || 30000);
      }

      // Create room
      roomManager.createRoom(matchId, enginePlayers);

      // Store player mapping
      this.matchPlayerMap.set(
        matchId,
        players.map((p) => p.userId)
      );

      // Notify via Socket.IO
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastToMatch(matchId, 'match_created', {
          matchId,
          players: enginePlayers,
        });
      }

      console.log(`[MatchmakingIntegration] Match ${matchId} created from queue ${queueEntryId}`);

      return {
        matchId,
        success: true,
        matchState,
      };
    } catch (error) {
      console.error('[MatchmakingIntegration] Error creating match:', error);
      return {
        matchId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Starts a match (called by LobbyManager when all players are ready)
   */
  startMatch(matchId: string): boolean {
    try {
      console.log(`[MatchmakingIntegration] Starting match ${matchId}...`);

      // Start the match
      engineService.startMatch(matchId);

      // Start session
      sessionManager.startSession(matchId);

      // Deal cards (moves match to DECLARATION phase)
      engineService.dealCards(matchId);

      // Notify via Socket.IO
      const socketManager = getSocketManager();
      console.log(
        `[MatchmakingIntegration] SocketManager instance:`,
        socketManager ? 'EXISTS' : 'NULL'
      );

      if (socketManager) {
        console.log(`[MatchmakingIntegration] Broadcasting match_started to match_${matchId}`);
        const payload = {
          matchId,
          config: engineService.getMatchState(matchId)?.config,
        };

        socketManager.broadcastToMatch(matchId, 'match_started', payload);
        socketManager.broadcastToMatch(matchId, 'match_started_ack', payload);
        console.log(`[MatchmakingIntegration] ✅ match_started broadcasted`);
      } else {
        console.error(`[MatchmakingIntegration] ❌ SocketManager is NULL!`);
      }

      // 🔁 START THE DECLARATION PHASE through the Socket layer (unified with the
      // socket 'start_match' path). This broadcasts `declaration_started` and — if
      // the Hakem is a bot — AUTO-DECLARES Hokm + has the bot lead the first card.
      // (We must NOT call `this.startTurn()` here: the match is in DECLARATION,
      // not PLAYING, so startTurn() would no-op with "not in PLAYING state".)
      if (socketManager) {
        socketManager.startDeclarationPhase(matchId);
      } else {
        console.error(
          '[MatchmakingIntegration] ❌ Cannot start declaration - SocketManager is NULL'
        );
      }

      console.log(`[MatchmakingIntegration] ✅ Match ${matchId} started successfully`);
      return true;
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error starting match ${matchId}:`, error);
      return false;
    }
  }

  /**
   * Sets a player's ready status
   */
  setPlayerReady(matchId: string, userId: string, isReady: boolean): boolean {
    try {
      console.log(
        `[MatchmakingIntegration] setPlayerReady: match=${matchId}, userId=${userId}, isReady=${isReady}`
      );

      const lobby = lobbyManager.getLobby(matchId);
      if (!lobby) {
        console.error(`[MatchmakingIntegration] Lobby not found for match ${matchId}`);
        return false;
      }

      // Find and update player
      const player = lobby.players.find((p) => p.id === userId || p.userId === userId);
      if (!player) {
        console.error(`[MatchmakingIntegration] Player ${userId} not found in lobby`);
        return false;
      }

      player.isReady = isReady;
      player.readyAt = isReady ? new Date() : undefined;
      lobbyManager['lobbies'].set(lobby.id, lobby);

      console.log(`[MatchmakingIntegration] Player ${userId} ready: ${isReady}`);

      // Check if all players are ready AND lobby is full
      const allReady = lobby.players.every((p) => p.isReady);
      const isFull = lobby.players.length >= 4;

      console.log(
        `[MatchmakingIntegration] Lobby status: allReady=${allReady}, isFull=${isFull}, players=${lobby.players.length}`
      );

      // 🔥 IMPORTANT: If all ready and full, start the match directly!
      if (allReady && isFull) {
        console.log(`[MatchmakingIntegration] 🚀 All players ready! Starting match ${matchId}...`);

        // Call startMatch directly
        const started = this.startMatch(matchId);

        if (started) {
          console.log(`[MatchmakingIntegration] ✅ Match ${matchId} started successfully`);
        } else {
          console.error(`[MatchmakingIntegration] ❌ Failed to start match ${matchId}`);
        }

        return started;
      }

      return true;
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error setting ready status for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Handles a player's card play
   */
  playCard(matchId: string, userId: string, cardId: string): boolean {
    try {
      engineService.playCard(matchId, userId, cardId);

      // Reset consecutive misses
      const matchState = engineService.getMatchState(matchId);
      if (matchState) {
        turnManager.resetConsecutiveMisses(matchId, userId, matchState);
      }

      // Broadcast via Socket.IO
      const socketManager = getSocketManager();
      if (socketManager) {
        const matchState = engineService.getMatchState(matchId);
        socketManager.broadcastToMatch(matchId, 'card_played', {
          playerId: userId,
          cardId,
          trick: matchState?.tricks[matchState?.currentTrickIndex - 1],
        });
        socketManager.broadcastToMatch(matchId, 'match_updated', {
          matchId,
          state: matchState,
        });
      }

      // Start next turn
      this.startTurn(matchId);

      return true;
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error playing card for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Handles Hokm declaration
   */
  declareHokm(matchId: string, userId: string, mode: string, suit?: string): boolean {
    try {
      const matchState = engineService.getMatchState(matchId);
      if (matchState) {
        matchState.config.mode = mode as EngineGameMode;
        if (suit) {
          matchState.config.trumpSuit = suit as Suit;
        }
      }

      // Broadcast via Socket.IO
      const socketManager = getSocketManager();
      if (socketManager) {
        socketManager.broadcastToMatch(matchId, 'match_updated', {
          matchId,
          state: matchState,
        });
      }

      console.log(`[MatchmakingIntegration] Player ${userId} declared Hokm: ${mode} ${suit || ''}`);
      return true;
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error declaring Hokm for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Handles player disconnection
   */
  handlePlayerDisconnect(matchId: string, userId: string): void {
    try {
      const matchState = engineService.getMatchState(matchId);
      if (!matchState) return;

      const result = disconnectManager.recordMiss(matchId, userId, matchState);

      if (result.shouldAutoKick) {
        disconnectManager.autoKickPlayer(matchId, userId, matchState);

        // Replace with bot
        const originalPlayer = matchState.players.find((p) => p.id === userId);
        if (originalPlayer) {
          const botPlayer = botManager.createBot(
            matchId,
            originalPlayer.userId,
            originalPlayer.username,
            originalPlayer.seatIndex,
            originalPlayer.teamId
          );
          roomManager.replaceWithBot(matchId, userId, botPlayer);

          // Update match state
          const playerIndex = matchState.players.findIndex((p) => p.id === userId);
          if (playerIndex !== -1) {
            matchState.players[playerIndex] = botPlayer;
          }
        }

        // Notify via Socket.IO
        const socketManager = getSocketManager();
        if (socketManager) {
          socketManager.broadcastToMatch(matchId, 'player_auto_kicked', {
            playerId: userId,
            message: 'Player removed due to inactivity',
          });
        }
      }
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error handling disconnect for ${userId}:`, error);
    }
  }

  /**
   * Handles player reconnection
   */
  handlePlayerReconnect(matchId: string, userId: string): boolean {
    try {
      const success = sessionManager.handlePlayerReconnect(matchId, userId);

      if (success) {
        const socketManager = getSocketManager();
        if (socketManager) {
          socketManager.broadcastToMatch(matchId, 'player_reconnected', {
            playerId: userId,
          });

          const matchState = engineService.getMatchState(matchId);
          socketManager.broadcastToMatch(matchId, 'match_updated', {
            matchId,
            state: matchState,
          });
        }
      }

      return success;
    } catch (error) {
      console.error(`[MatchmakingIntegration] Error handling reconnect for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Starts a turn (next player)
   * Public so the Socket layer can kick off an automatic bot turn when the
   * Hakem is a bot (bots auto-declare then auto-lead the first card).
   */
  startTurn(matchId: string): void {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

    const currentPlayerId = matchState.currentPlayerId;
    const players = matchState.players.filter((p) => p.isActive);

    let nextPlayerId: string | undefined;
    if (!currentPlayerId) {
      nextPlayerId = matchState.hakemId;
    } else {
      const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
      const nextIndex = (currentIndex + 1) % players.length;
      nextPlayerId = players[nextIndex]?.id;
    }

    if (!nextPlayerId) return;

    // Check if next player is a bot
    const nextPlayer = matchState.players.find((p) => p.id === nextPlayerId);
    if (nextPlayer?.isBot) {
      // Bot plays automatically after a short delay
      setTimeout(() => {
        this.botPlayCard(matchId, nextPlayerId!);
      }, 500);
      return;
    }

    const turnInfo = turnManager.startTurn(matchId, nextPlayerId, TurnPhase.PLAYING, matchState);

    matchState.currentPlayerId = nextPlayerId;

    const socketManager = getSocketManager();
    if (socketManager) {
      socketManager.broadcastToMatch(matchId, 'turn_started', {
        playerId: nextPlayerId,
        timeoutMs: turnInfo.timeoutMs,
      });
    }
  }

  /**
   * Makes a BOT play a card immediately (public wrapper around botPlayCard).
   * Used when a bot is the Hakem right after an auto-declaration, so the bot
   * leads the first trick without waiting for a turn-start broadcast.
   */
  makeBotPlay(matchId: string, botId: string): void {
    this.botPlayCard(matchId, botId);
  }

  /**
   * Bot plays a card automatically
   */
  private botPlayCard(matchId: string, botId: string): void {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

    // Get lead suit from current trick
    const currentTrickIndex = matchState.currentTrickIndex;
    const currentTrick = matchState.tricks[currentTrickIndex];
    const leadSuit = currentTrick?.leadSuit;

    // Bot selects a card
    const result = botManager.playCard(matchState, botId, leadSuit);
    if (result) {
      this.playCard(matchId, botId, result.cardId);
    }
  }

  /**
   * Maps Matchmaking GameMode to Engine GameMode
   */
  private mapGameMode(mode: MatchmakingGameMode): EngineGameMode {
    switch (mode) {
      case MatchmakingGameMode.RANKED:
      case MatchmakingGameMode.FRIENDLY:
      case MatchmakingGameMode.PRACTICE:
        return 'HOKM' as EngineGameMode; // All modes use Hokm engine
      default:
        return 'HOKM' as EngineGameMode;
    }
  }

  /**
   * Gets the players in a match
   */
  getMatchPlayers(matchId: string): string[] {
    return this.matchPlayerMap.get(matchId) || [];
  }

  /**
   * Gets match statistics
   */
  getMatchStatistics(matchId: string): MatchStatisticsRecord | null {
    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return null;

    const players = matchState.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      teamId: p.teamId,
      tricksWon: 0, // TODO: Track per-player tricks
      setsWon: matchState.teams.find((t) => t.id === p.teamId)?.setsWon || 0,
      isWinner: false, // TODO: Determine winner
    }));

    // Determine winner
    const winningTeam = matchState.teams.find(
      (t) => t.setsWon >= this.config.defaultTotalSetsToWin
    );
    if (winningTeam) {
      players.forEach((p) => {
        if (p.teamId === winningTeam.id) {
          p.isWinner = true;
        }
      });
    }

    return {
      matchId,
      players,
      duration: matchState.completedAt
        ? matchState.completedAt.getTime() - (matchState.startedAt?.getTime() || Date.now())
        : 0,
      completedAt: matchState.completedAt || new Date(),
      gameMode: MatchmakingGameMode.RANKED, // TODO: Track actual mode
    };
  }

  /**
   * Cleans up match data
   */
  cleanupMatch(matchId: string): void {
    this.matchPlayerMap.delete(matchId);
    botManager.cleanupMatch(matchId);
    roomManager.removeRoom(matchId);
    lobbyManager.closeLobby(matchId);
    console.log(`[MatchmakingIntegration] Cleaned up match ${matchId}`);
  }

  /**
   * Updates configuration
   */
  updateConfig(config: Partial<MatchmakingIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets current configuration
   */
  getConfig(): MatchmakingIntegrationConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const matchmakingIntegration = new MatchmakingIntegrationService({
  defaultTotalSetsToWin: 7,
  defaultTurnTimeoutMs: 8000,
  defaultDeclarationTimeoutMs: 20000,
  defaultReadyTimeoutMs: 30000, // 30s lobby fill timeout before bot-fill
  botReplacementEnabled: true,
  coinPenaltyAmount: 0, // TBD per RULEBOOK.md Section 13
});
