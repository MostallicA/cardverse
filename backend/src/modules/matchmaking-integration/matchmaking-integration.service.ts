/**
 * Matchmaking Integration Service
 *
 * Connects Matchmaking Foundation with Engine Layer
 * Per ARCHITECTURE.md Section 3.2 and DASHBOARD.md Task 7.0
 */

import { GameMode as MatchmakingGameMode } from '../matchmaking/matchmaking.types';
import { GameMode as EngineGameMode, Player, MatchConfig } from '../../engine/engine.types';
import { engineService } from '../../engine/engine.service';
import { lobbyManager } from '../../engine/lobby/lobby.manager';
import { roomManager } from '../../engine/room/room.manager';
import { sessionManager } from '../../engine/session/session.manager';
import { botManager } from '../../engine/bot/bot.manager';
import { turnManager } from '../../engine/turn/turn.manager';
import { disconnectManager } from '../../engine/disconnect/disconnect.manager';
import { getSocketManager } from '../../socket';

import {
  MatchmakingMatchRequest,
  MatchCreationResult,
  MatchmakingIntegrationConfig,
  MatchStatisticsRecord,
} from './matchmaking-integration.types';

export class MatchmakingIntegrationService {
  private config: MatchmakingIntegrationConfig;
  private matchPlayerMap: Map<string, string[]> = new Map(); // matchId -> userIds

  constructor(config: MatchmakingIntegrationConfig) {
    this.config = config;
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

      // Create lobby (host is the first player)
      lobbyManager.createLobby(matchId, matchId, enginePlayers[0].id, enginePlayers[0].username);

      // Add remaining players to lobby (skip the host)
      for (let i = 1; i < enginePlayers.length; i++) {
        lobbyManager.addPlayer(matchId, enginePlayers[i]);
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
   * Starts a match (all players ready)
   */
  startMatch(matchId: string): boolean {
    try {
      // Start the match
      engineService.startMatch(matchId);

      // Start session
      sessionManager.startSession(matchId);

      // Deal cards
      engineService.dealCards(matchId);

      // Start first turn
      this.startTurn(matchId);

      // Notify via Socket.IO
      const socketManager = getSocketManager();
      if (socketManager) {
        const matchState = engineService.getMatchState(matchId);
        socketManager.broadcastToMatch(matchId, 'match_started', {
          matchId,
          config: matchState?.config,
        });
      }

      console.log(`[MatchmakingIntegration] Match ${matchId} started`);
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
      lobbyManager.setPlayerReady(matchId, userId, isReady);

      // Check if all players are ready
      const lobby = lobbyManager.getLobby(matchId);
      if (lobby && lobbyManager.areAllPlayersReady(lobby) && lobbyManager.isLobbyFull(lobby)) {
        // All players ready - start the match
        lobbyManager.startLobby(matchId);
        return this.startMatch(matchId);
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
        matchState.config.mode = mode as any;
        if (suit) {
          matchState.config.trumpSuit = suit as any;
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
   */
  private startTurn(matchId: string): void {
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

    const turnInfo = turnManager.startTurn(matchId, nextPlayerId, 'playing' as any, matchState);

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
  botReplacementEnabled: true,
  coinPenaltyAmount: 0, // TBD per RULEBOOK.md Section 13
});
