// Session Manager - Manages match lifecycle from start to finish
// Per ARCHITECTURE.md Section 3.2

import { MatchState, EngineStatus, Player, MatchConfig } from '../engine.types.js';
import { engineService } from '../engine.service.js';
import { turnManager } from '../turn/turn.manager.js';
import { disconnectManager } from '../disconnect/disconnect.manager.js';
import { botManager } from '../../game/bot/bot.manager.js';
import { lobbyManager } from '../lobby/lobby.manager.js';
import { roomManager } from '../room/room.manager.js';

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
  // Tracks which USER (by userId) is currently bound to which ACTIVE match.
  // Security: enforces "one active match per user" (SERVER-AUTHORITATIVE fair play).
  private playerActiveMatch: Map<string, string> = new Map(); // userId -> matchId

  /**
   * REGISTERS a user as bound to a match.
   * Returns `false` (and does nothing) if the user is ALREADY bound to a different
   * active match — prevents multi-account / multi-tab match stuffing.
   */
  bindPlayerToMatch(userId: string, matchId: string): boolean {
    const active = this.playerActiveMatch.get(userId);
    if (active === matchId) {
      return true; // same match → idempotent
    }
    if (active) {
      const session = this.sessions.get(`session_${active}`);
      if (session && session.status === 'active') {
        console.warn(
          `[SessionManager] Rejected bind: user ${userId} is already in active match ${active}`
        );
        return false;
      }
      // The previous session is not active anymore → allow bind and clear old.
      this.playerActiveMatch.delete(userId);
    }
    this.playerActiveMatch.set(userId, matchId);
    return true;
  }

  /**
   * Returns the matchId a user is currently bound to, or null.
   */
  getActiveMatchForUser(userId: string): string | null {
    const matchId = this.playerActiveMatch.get(userId);
    if (!matchId) return null;
    const session = this.sessions.get(`session_${matchId}`);
    if (session && session.status !== 'active') {
      this.playerActiveMatch.delete(userId); // lazily clean stale
      return null;
    }
    return matchId;
  }

  /**
   * Removes a user→match binding (on match completion/cleanup).
   */
  unbindPlayerFromMatch(userId: string, matchId: string): void {
    if (this.playerActiveMatch.get(userId) === matchId) {
      this.playerActiveMatch.delete(userId);
    }
  }

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
    // Bind each real (non-bot) player's userId to this match (fair-play enforcement).
    for (const player of players) {
      if (!player.isBot) {
        this.playerActiveMatch.set(player.userId, matchId);
      }
    }
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

    // Initialize match state in engine ONLY when the match hasn't been
    // started yet. In the matchmaking flow, engineService.startMatch() is
    // already invoked before startSession(), so re-starting here would throw
    // ("Match is not in INITIALIZING state") and abort the whole start.
    const matchState = engineService.getMatchState(matchId);
    if (matchState && matchState.status === EngineStatus.INITIALIZING) {
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

    // Release user→match bindings so users can join a new match.
    for (const player of session.players) {
      if (!player.isBot) {
        this.playerActiveMatch.delete(player.userId);
      }
    }

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

    // Release user→match bindings.
    for (const player of session.players) {
      if (!player.isBot) {
        this.playerActiveMatch.delete(player.userId);
      }
    }

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
