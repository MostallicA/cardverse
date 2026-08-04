// Session Manager - Manages match lifecycle from start to finish
// Per ARCHITECTURE.md Section 3.2

import {
  MatchState,
  EngineStatus,
  Player,
  MatchConfig,
  GameMode,
  Suit,
  SpecialOutcome,
  RoundResult,
} from '../engine.types';
import { engineService } from '../engine.service';
import { ruleExecutor } from '../card/rule.executor';
import { turnManager } from '../turn/turn.manager';
import { disconnectManager } from '../disconnect/disconnect.manager';
import { botManager } from '../bot/bot.manager';
import { lobbyManager } from '../lobby/lobby.manager';
import { roomManager } from '../room/room.manager';

export interface Session {
  id: string;
  matchId: string;
  status: 'pending' | 'active' | 'completed' | 'aborted';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  players: Player[];
  config: MatchConfig;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * Creates a new session for a match
   */
  createSession(matchId: string, players: Player[], config: MatchConfig): Session {
    const session: Session = {
      id: `session_${matchId}`,
      matchId,
      status: 'pending',
      createdAt: new Date(),
      players,
      config,
    };

    this.sessions.set(session.id, session);
    console.log(`[SessionManager] Session created for match ${matchId}`);
    return session;
  }

  /**
   * Starts a session (moves from pending to active)
   */
  startSession(matchId: string): Session | null {
    const session = this.getSessionByMatch(matchId);
    if (!session) return null;

    if (session.status !== 'pending') {
      throw new Error(`Session ${session.id} is not in pending state`);
    }

    session.status = 'active';
    session.startedAt = new Date();

    // Initialize match state in engine
    const matchState = engineService.getMatchState(matchId);
    if (matchState) {
      matchState.status = EngineStatus.PLAYING;
      engineService.startMatch(matchId);
    }

    this.sessions.set(session.id, session);
    console.log(`[SessionManager] Session started for match ${matchId}`);
    return session;
  }

  /**
   * Completes a session
   */
  completeSession(matchId: string): Session | null {
    const session = this.getSessionByMatch(matchId);
    if (!session) return null;

    session.status = 'completed';
    session.completedAt = new Date();

    // Update match state
    const matchState = engineService.getMatchState(matchId);
    if (matchState) {
      matchState.status = EngineStatus.COMPLETED;
      matchState.isComplete = true;
      matchState.completedAt = new Date();
    }

    // Clean up turn manager timers
    turnManager['clearTimer'](matchId);

    this.sessions.set(session.id, session);
    console.log(`[SessionManager] Session completed for match ${matchId}`);
    return session;
  }

  /**
   * Aborts a session (due to error or cancellation)
   */
  abortSession(matchId: string): Session | null {
    const session = this.getSessionByMatch(matchId);
    if (!session) return null;

    session.status = 'aborted';
    session.completedAt = new Date();

    // Clean up
    turnManager['clearTimer'](matchId);
    roomManager.removeRoom(matchId);
    lobbyManager.closeLobby(matchId);

    this.sessions.set(session.id, session);
    console.log(`[SessionManager] Session aborted for match ${matchId}`);
    return session;
  }

  /**
   * Gets a session by ID
   */
  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * Gets a session by match ID
   */
  getSessionByMatch(matchId: string): Session | undefined {
    for (const [, session] of this.sessions) {
      if (session.matchId === matchId) {
        return session;
      }
    }
    return undefined;
  }

  /**
   * Gets all active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'active');
  }

  /**
   * Gets all pending sessions
   */
  getPendingSessions(): Session[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'pending');
  }

  /**
   * Gets session statistics
   */
  getStats(): {
    total: number;
    active: number;
    pending: number;
    completed: number;
    aborted: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      total: sessions.length,
      active: sessions.filter((s) => s.status === 'active').length,
      pending: sessions.filter((s) => s.status === 'pending').length,
      completed: sessions.filter((s) => s.status === 'completed').length,
      aborted: sessions.filter((s) => s.status === 'aborted').length,
    };
  }

  /**
   * Handles a player disconnect
   */
  handlePlayerDisconnect(matchId: string, playerId: string): void {
    const session = this.getSessionByMatch(matchId);
    if (!session) return;

    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return;

    // Record miss via disconnect manager
    const result = disconnectManager.recordMiss(matchId, playerId, matchState);

    if (result.shouldAutoKick) {
      // Auto-kick the player
      disconnectManager.autoKickPlayer(matchId, playerId, matchState);

      // Replace with bot
      const botPlayer = this.createBotForPlayer(matchId, playerId, matchState);
      if (botPlayer) {
        roomManager.replaceWithBot(matchId, playerId, botPlayer);
        // Update match state players
        const playerIndex = matchState.players.findIndex((p) => p.id === playerId);
        if (playerIndex !== -1) {
          matchState.players[playerIndex] = botPlayer;
        }
        console.log(`[SessionManager] Player ${playerId} replaced with bot in match ${matchId}`);
      }
    }

    console.log(
      `[SessionManager] Player ${playerId} disconnected from match ${matchId} (miss ${result.consecutiveMisses})`
    );
  }

  /**
   * Handles a player reconnect
   */
  handlePlayerReconnect(matchId: string, playerId: string): boolean {
    const session = this.getSessionByMatch(matchId);
    if (!session) return false;

    const matchState = engineService.getMatchState(matchId);
    if (!matchState) return false;

    // Check if player can reconnect
    if (!disconnectManager.canReconnect(playerId, matchId)) {
      return false;
    }

    // Reconnect player
    const success = disconnectManager.reconnectPlayer(matchId, playerId, matchState);
    if (!success) return false;

    // Find the bot that replaced this player and remove it
    const botId = matchState.players.find((p) => p.isBot && p.userId === playerId)?.id;
    if (botId) {
      roomManager.replaceBotWithPlayer(
        matchId,
        botId,
        matchState.players.find((p) => p.id === playerId)!
      );
      botManager.removeBot(matchId, botId);
    }

    console.log(`[SessionManager] Player ${playerId} reconnected to match ${matchId}`);
    return true;
  }

  /**
   * Creates a bot to replace a disconnected player
   */
  private createBotForPlayer(
    matchId: string,
    playerId: string,
    matchState: MatchState
  ): Player | null {
    const originalPlayer = matchState.players.find((p) => p.id === playerId);
    if (!originalPlayer) return null;

    return botManager.createBot(
      matchId,
      originalPlayer.userId,
      originalPlayer.username,
      originalPlayer.seatIndex,
      originalPlayer.teamId
    );
  }

  /**
   * Cleans up old sessions (completed or aborted for more than 1 hour)
   */
  cleanup(olderThanMs: number = 3600000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, session] of this.sessions) {
      if (session.status === 'completed' || session.status === 'aborted') {
        const endTime = session.completedAt || session.createdAt;
        const age = now - endTime.getTime();
        if (age > olderThanMs) {
          toRemove.push(id);
          // Clean up associated resources
          if (session.status === 'completed' || session.status === 'aborted') {
            roomManager.removeRoom(session.matchId);
            lobbyManager.closeLobby(session.matchId);
          }
        }
      }
    }

    for (const id of toRemove) {
      this.sessions.delete(id);
      console.log(`[SessionManager] Cleaned up old session ${id}`);
    }
  }

  /**
   * Gets a player's current session
   */
  getPlayerSession(playerId: string): Session | null {
    for (const [, session] of this.sessions) {
      if (session.players.some((p) => p.id === playerId)) {
        return session;
      }
    }
    return null;
  }

  /**
   * Checks if a player is in an active session
   */
  isPlayerInActiveSession(playerId: string): boolean {
    const session = this.getPlayerSession(playerId);
    return session?.status === 'active';
  }

  /**
   * Gets the match ID for a player's session
   */
  getMatchIdForPlayer(playerId: string): string | null {
    const session = this.getPlayerSession(playerId);
    return session?.matchId || null;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
