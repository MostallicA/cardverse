// Turn Manager - Manages turn order, timers, and consecutive misses

import { MatchState, Player } from '../engine.types';

import { TurnPhase, TurnInfo, TurnManagerConfig } from './turn.types';

export class TurnManager {
  private config: TurnManagerConfig;
  private turnTimers: Map<string, NodeJS.Timeout> = new Map();
  private turnInfoMap: Map<string, TurnInfo> = new Map();

  constructor(config: TurnManagerConfig) {
    this.config = config;
  }

  /**
   * Gets the next player in counter-clockwise order
   * Per RULEBOOK.md Section 2
   */
  getNextPlayer(currentPlayerId: string, players: Player[]): Player | undefined {
    const playerIds = players.filter((p) => p.isActive).map((p) => p.id);
    const currentIndex = playerIds.indexOf(currentPlayerId);

    if (currentIndex === -1) {
      // Current player not found - return first active player
      return players.find((p) => p.isActive);
    }

    // Counter-clockwise = next index (with wrap-around)
    const nextIndex = (currentIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];
    return players.find((p) => p.id === nextPlayerId && p.isActive);
  }

  /**
   * Gets the current turn info for a match
   */
  getTurnInfo(matchId: string): TurnInfo | undefined {
    return this.turnInfoMap.get(matchId);
  }

  /**
   * Starts a new turn for a player
   */
  startTurn(matchId: string, playerId: string, phase: TurnPhase, match: MatchState): TurnInfo {
    // Clear any existing timer for this match
    this.clearTimer(matchId);

    const timeoutMs =
      phase === TurnPhase.DECLARATION
        ? this.config.declarationTimeoutMs
        : this.config.turnTimeoutMs;

    const turnInfo: TurnInfo = {
      playerId,
      phase,
      startedAt: new Date(),
      timeoutMs,
      isCompleted: false,
    };

    this.turnInfoMap.set(matchId, turnInfo);

    // Set timer for auto-play on timeout
    const timer = setTimeout(() => {
      this.handleTurnTimeout(matchId, playerId, phase, match);
    }, timeoutMs);

    this.turnTimers.set(matchId, timer);

    return turnInfo;
  }

  /**
   * Completes a turn successfully (card played or Hokm declared)
   */
  completeTurn(matchId: string, cardId?: string): TurnInfo | undefined {
    const turnInfo = this.turnInfoMap.get(matchId);
    if (!turnInfo) return undefined;

    turnInfo.isCompleted = true;
    if (cardId) {
      turnInfo.cardPlayed = cardId;
    }

    this.clearTimer(matchId);
    this.turnInfoMap.set(matchId, turnInfo);

    return turnInfo;
  }

  /**
   * Handles turn timeout (auto-play/auto-declare)
   * Per RULEBOOK.md Section 12
   */
  private handleTurnTimeout(
    matchId: string,
    playerId: string,
    _phase: TurnPhase,
    match: MatchState
  ): void {
    const player = match.players.find((p) => p.id === playerId);
    if (!player) return;

    // Increment consecutive misses
    player.consecutiveMisses += 1;

    // Check if player should be auto-kicked (3 consecutive misses)
    // Per RULEBOOK.md Section 12: "If a player misses 3 consecutive turns,
    // they are removed from the table on the 4th missed turn"
    if (player.consecutiveMisses >= this.config.maxConsecutiveMisses + 1) {
      this.handleAutoKick(matchId, playerId, match);
    }

    // The actual auto-play/auto-declare logic is handled by the Engine Service
    // This manager only tracks and notifies
    this.clearTimer(matchId);
  }

  /**
   * Handles auto-kick of a player
   * Per RULEBOOK.md Section 12
   */
  private handleAutoKick(matchId: string, playerId: string, match: MatchState): void {
    const player = match.players.find((p) => p.id === playerId);
    if (!player) return;

    // Mark player as inactive
    player.isActive = false;

    // Reset consecutive misses (already at limit)
    // The bot takeover is handled by BotManager

    // Emit auto-kick event
    console.log(`[TurnManager] Player ${playerId} auto-kicked from match ${matchId}`);
  }

  /**
   * Resets consecutive misses for a player (when they successfully play)
   * Per RULEBOOK.md Section 12: "counter resets to zero"
   */
  resetConsecutiveMisses(_matchId: string, playerId: string, match: MatchState): void {
    const player = match.players.find((p) => p.id === playerId);
    if (player) {
      player.consecutiveMisses = 0;
    }
  }

  /**
   * Gets the player with the most consecutive misses (for monitoring)
   */
  getPlayersWithMisses(match: MatchState): { playerId: string; consecutiveMisses: number }[] {
    return match.players
      .filter((p) => p.consecutiveMisses > 0)
      .map((p) => ({
        playerId: p.id,
        consecutiveMisses: p.consecutiveMisses,
      }));
  }

  /**
   * Clears the timer for a match
   */
  private clearTimer(matchId: string): void {
    const timer = this.turnTimers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.turnTimers.delete(matchId);
    }
  }

  /**
   * Cleans up all timers (for shutdown)
   */
  cleanup(): void {
    for (const [, timer] of this.turnTimers) {
      clearTimeout(timer);
    }
    this.turnTimers.clear();
    this.turnInfoMap.clear();
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<TurnManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): TurnManagerConfig {
    return { ...this.config };
  }
}

// Export singleton instance with default config
export const turnManager = new TurnManager({
  declarationTimeoutMs: 20000, // 20 seconds
  turnTimeoutMs: 8000, // 8 seconds
  maxConsecutiveMisses: 3, // 3 misses before auto-kick on 4th
});
