// Disconnect Manager - Manages player disconnections, auto-kick, and reconnection
// Per RULEBOOK.md Section 12

import { MatchState } from '../engine.types.js';

export interface DisconnectConfig {
  maxConsecutiveMisses: number; // 3 per RULEBOOK.md
  coinPenaltyAmount: number; // TBD - open item per RULEBOOK.md Section 13
  reconnectionWindowMs: number; // Time window for reconnection
}

export interface DisconnectEvent {
  playerId: string;
  matchId: string;
  type: 'miss' | 'auto_kick' | 'reconnect' | 'bot_takeover';
  consecutiveMisses: number;
  timestamp: Date;
}

export class DisconnectManager {
  private config: DisconnectConfig;
  private disconnectEvents: Map<string, DisconnectEvent[]> = new Map();
  private kickedPlayers: Map<string, { matchId: string; kickedAt: Date; playerId: string }> =
    new Map();

  constructor(config: DisconnectConfig) {
    this.config = config;
  }

  /**
   * Records a missed turn for a player
   * Returns true if the player should be auto-kicked
   */
  recordMiss(
    matchId: string,
    playerId: string,
    match: MatchState
  ): {
    shouldAutoKick: boolean;
    consecutiveMisses: number;
  } {
    const player = match.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in match`);
    }

    // Increment consecutive misses
    player.consecutiveMisses += 1;

    // Record event
    const event: DisconnectEvent = {
      playerId,
      matchId,
      type: 'miss',
      consecutiveMisses: player.consecutiveMisses,
      timestamp: new Date(),
    };
    this.addEvent(matchId, event);

    // Check if player should be auto-kicked
    // Per RULEBOOK.md: "If a player misses 3 consecutive turns,
    // they are removed from the table on the 4th missed turn"
    const shouldAutoKick = player.consecutiveMisses >= this.config.maxConsecutiveMisses + 1;

    return {
      shouldAutoKick,
      consecutiveMisses: player.consecutiveMisses,
    };
  }

  /**
   * Auto-kicks a player from the match
   * Per RULEBOOK.md Section 12
   */
  autoKickPlayer(matchId: string, playerId: string, match: MatchState): void {
    const player = match.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in match`);
    }

    // Mark player as inactive
    player.isActive = false;

    // Record auto-kick event
    const event: DisconnectEvent = {
      playerId,
      matchId,
      type: 'auto_kick',
      consecutiveMisses: player.consecutiveMisses,
      timestamp: new Date(),
    };
    this.addEvent(matchId, event);

    // Store kicked player info for potential reconnection
    this.kickedPlayers.set(playerId, {
      matchId,
      kickedAt: new Date(),
      playerId,
    });

    // Reset consecutive misses (they're no longer in the game)
    player.consecutiveMisses = 0;

    // TODO:
    // - Send notification to player
    // - Apply coin penalty (amount TBD per RULEBOOK.md Section 13)
    // - Trigger bot takeover (handled by BotManager)
    console.log(`[DisconnectManager] Player ${playerId} auto-kicked from match ${matchId}`);
  }

  /**
   * Resets consecutive misses for a player (when they successfully play)
   * Per RULEBOOK.md Section 12: "counter resets to zero"
   */
  resetMisses(_matchId: string, playerId: string, match: MatchState): void {
    const player = match.players.find((p) => p.id === playerId);
    if (player) {
      player.consecutiveMisses = 0;
    }
  }

  /**
   * Checks if a player can reconnect to a match
   * Per RULEBOOK.md: "The removed player may rejoin the same seat later in the same Match"
   */
  canReconnect(playerId: string, matchId: string): boolean {
    const kickedInfo = this.kickedPlayers.get(playerId);
    if (!kickedInfo) return false;

    // Check if the player was kicked from this match
    if (kickedInfo.matchId !== matchId) return false;

    // Check if reconnection window hasn't expired
    const elapsed = Date.now() - kickedInfo.kickedAt.getTime();
    if (elapsed > this.config.reconnectionWindowMs) {
      this.kickedPlayers.delete(playerId);
      return false;
    }

    return true;
  }

  /**
   * Reconnects a player to a match
   * Per RULEBOOK.md: "replaces the bot"
   */
  reconnectPlayer(matchId: string, playerId: string, match: MatchState): boolean {
    if (!this.canReconnect(playerId, matchId)) {
      return false;
    }

    const player = match.players.find((p) => p.id === playerId);
    if (!player) return false;

    // Reactivate player
    player.isActive = true;
    player.consecutiveMisses = 0;

    // Record reconnect event
    const event: DisconnectEvent = {
      playerId,
      matchId,
      type: 'reconnect',
      consecutiveMisses: 0,
      timestamp: new Date(),
    };
    this.addEvent(matchId, event);

    // Remove from kicked players
    this.kickedPlayers.delete(playerId);

    // TODO: Notify BotManager to remove bot from this seat
    console.log(`[DisconnectManager] Player ${playerId} reconnected to match ${matchId}`);

    return true;
  }

  /**
   * Gets the disconnect events for a match
   */
  getEvents(matchId: string): DisconnectEvent[] {
    return this.disconnectEvents.get(matchId) || [];
  }

  /**
   * Gets all kicked players
   */
  getKickedPlayers(): { playerId: string; matchId: string; kickedAt: Date }[] {
    return Array.from(this.kickedPlayers.entries()).map(([playerId, info]) => ({
      playerId,
      matchId: info.matchId,
      kickedAt: info.kickedAt,
    }));
  }

  /**
   * Checks if a player is currently kicked
   */
  isPlayerKicked(playerId: string): boolean {
    return this.kickedPlayers.has(playerId);
  }

  /**
   * Gets the match ID for a kicked player
   */
  getKickedMatchId(playerId: string): string | undefined {
    const info = this.kickedPlayers.get(playerId);
    return info?.matchId;
  }

  /**
   * Cleans up expired reconnection entries
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [playerId, info] of this.kickedPlayers) {
      const elapsed = now - info.kickedAt.getTime();
      if (elapsed > this.config.reconnectionWindowMs) {
        this.kickedPlayers.delete(playerId);
      }
    }
  }

  /**
   * Adds an event to the event log
   */
  private addEvent(matchId: string, event: DisconnectEvent): void {
    if (!this.disconnectEvents.has(matchId)) {
      this.disconnectEvents.set(matchId, []);
    }
    this.disconnectEvents.get(matchId)!.push(event);
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<DisconnectConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): DisconnectConfig {
    return { ...this.config };
  }
}

// Export singleton instance with default config
// Note: coinPenaltyAmount is TBD per RULEBOOK.md Section 13
export const disconnectManager = new DisconnectManager({
  maxConsecutiveMisses: 3,
  coinPenaltyAmount: 0, // TBD - to be set after playtesting
  reconnectionWindowMs: 300000, // 5 minutes default
});
