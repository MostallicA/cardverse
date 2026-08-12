/**
 * Matchmaking - Service Layer
 * CV-MOD-007
 *
 * Implements business logic for matchmaking including queue management,
 * player matching, and match creation.
 */

import {
  MatchmakingQueueEntry,
  MatchmakingCriteria,
  MatchFound,
  JoinQueueRequest,
  QueueStatusResponse,
  MatchmakingStats,
  GameMode,
  MatchmakingStatus,
} from './matchmaking.types.js';

// In-memory stores (will be replaced with Redis in production)
const queue = new Map<string, MatchmakingQueueEntry>(); // userId -> queue entry
const matches = new Map<string, MatchFound>(); // matchId -> match found
// const matchCounter = 0;

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Default matchmaking criteria
const DEFAULT_CRITERIA: MatchmakingCriteria = {
  skillRange: 100, // Initial skill range
  fairPlayThreshold: 20, // Fair play score tolerance
  regionMatch: true, // Match players from same region
  maxLatency: 150, // Maximum latency in ms
  maxQueueTime: 300, // Maximum queue time in seconds
  expansionRate: 50, // Skill range expansion per minute
};

export class MatchmakingService {
  /**
   * Join the matchmaking queue
   */
  async joinQueue(userId: string, request: JoinQueueRequest): Promise<QueueStatusResponse> {
    // Check if already in queue
    if (queue.has(userId)) {
      throw new Error('User is already in the queue');
    }

    const entry: MatchmakingQueueEntry = {
      userId,
      gameMode: request.gameMode,
      skillRating: 1000, // Default skill rating (should come from user service)
      fairPlayScore: 100, // Default fair play score (should come from user service)
      region: request.region || 'global',
      latency: 50, // Default latency (should come from user service)
      joinedAt: new Date(),
      lastUpdated: new Date(),
      searchRadius: DEFAULT_CRITERIA.skillRange,
    };

    queue.set(userId, entry);

    return this.getQueueStatus(userId);
  }

  /**
   * Leave the matchmaking queue
   */
  async leaveQueue(userId: string): Promise<void> {
    if (!queue.has(userId)) {
      throw new Error('User is not in the queue');
    }
    queue.delete(userId);
  }

  /**
   * Get queue status for a user
   */
  async getQueueStatus(userId: string): Promise<QueueStatusResponse> {
    const entry = queue.get(userId);
    if (!entry) {
      throw new Error('User is not in the queue');
    }

    const queuePosition = this.getQueuePosition(userId);
    const elapsedTime = (Date.now() - entry.joinedAt.getTime()) / 1000;
    const estimatedWaitTime = this.calculateEstimatedWaitTime(entry.gameMode);

    return {
      userId: entry.userId,
      status: MatchmakingStatus.SEARCHING,
      queuePosition,
      estimatedWaitTime,
      elapsedTime,
      searchRadius: entry.searchRadius,
    };
  }

  /**
   * Find a match for a user (called periodically)
   */
  async findMatch(userId: string): Promise<MatchFound | null> {
    const entry = queue.get(userId);
    if (!entry) {
      return null;
    }

    // Update search radius based on queue time
    const elapsedTime = (Date.now() - entry.joinedAt.getTime()) / 1000;
    const expansion = Math.floor(elapsedTime / 60) * DEFAULT_CRITERIA.expansionRate;
    entry.searchRadius = DEFAULT_CRITERIA.skillRange + expansion;
    entry.lastUpdated = new Date();
    queue.set(userId, entry);

    // Find potential opponents
    const opponents = this.findPotentialOpponents(entry);

    if (opponents.length === 0) {
      return null;
    }

    // Select the best opponent
    const selectedOpponent = this.selectBestOpponent(entry, opponents);

    if (!selectedOpponent) {
      return null;
    }

    // Create match
    const match = this.createMatch(entry, selectedOpponent);

    // Remove both players from queue
    queue.delete(userId);
    queue.delete(selectedOpponent.userId);

    return match;
  }

  /**
   * Find potential opponents for a player
   */
  private findPotentialOpponents(entry: MatchmakingQueueEntry): MatchmakingQueueEntry[] {
    const opponents: MatchmakingQueueEntry[] = [];

    for (const [userId, opponent] of queue) {
      // Skip self
      if (userId === entry.userId) {
        continue;
      }

      // Check game mode
      if (opponent.gameMode !== entry.gameMode) {
        continue;
      }

      // Check skill range
      const skillDiff = Math.abs(opponent.skillRating - entry.skillRating);
      if (skillDiff > entry.searchRadius) {
        continue;
      }

      // Check fair play score
      const fairPlayDiff = Math.abs(opponent.fairPlayScore - entry.fairPlayScore);
      if (fairPlayDiff > DEFAULT_CRITERIA.fairPlayThreshold) {
        continue;
      }

      // Check region (if region matching is enabled)
      if (DEFAULT_CRITERIA.regionMatch && opponent.region !== entry.region) {
        // Allow cross-region if queue time is high
        const elapsedTime = (Date.now() - entry.joinedAt.getTime()) / 1000;
        if (elapsedTime < DEFAULT_CRITERIA.maxQueueTime) {
          continue;
        }
      }

      // Check latency
      if (opponent.latency > DEFAULT_CRITERIA.maxLatency) {
        continue;
      }

      opponents.push(opponent);
    }

    return opponents;
  }

  /**
   * Select the best opponent from a list
   */
  private selectBestOpponent(
    entry: MatchmakingQueueEntry,
    opponents: MatchmakingQueueEntry[]
  ): MatchmakingQueueEntry | null {
    if (opponents.length === 0) {
      return null;
    }

    // Sort by skill difference (closest skill match first)
    opponents.sort((a, b) => {
      const diffA = Math.abs(a.skillRating - entry.skillRating);
      const diffB = Math.abs(b.skillRating - entry.skillRating);
      return diffA - diffB;
    });

    return opponents[0];
  }

  /**
   * Create a match from two players
   */
  private createMatch(player1: MatchmakingQueueEntry, player2: MatchmakingQueueEntry): MatchFound {
    const matchId = generateId();

    const match: MatchFound = {
      matchId,
      players: [
        {
          userId: player1.userId,
          skillRating: player1.skillRating,
          fairPlayScore: player1.fairPlayScore,
          region: player1.region,
        },
        {
          userId: player2.userId,
          skillRating: player2.skillRating,
          fairPlayScore: player2.fairPlayScore,
          region: player2.region,
        },
      ],
      gameMode: player1.gameMode,
      createdAt: new Date(),
    };

    matches.set(matchId, match);
    return match;
  }

  /**
   * Get queue position for a user
   */
  private getQueuePosition(userId: string): number {
    let position = 1;
    const entry = queue.get(userId);
    if (!entry) {
      return 0;
    }

    for (const [otherUserId, otherEntry] of queue) {
      if (otherUserId === userId) {
        continue;
      }
      // Compare by join time (earlier = higher priority)
      if (otherEntry.joinedAt < entry.joinedAt) {
        position++;
      }
    }

    return position;
  }

  /**
   * Calculate estimated wait time for a game mode
   */
  private calculateEstimatedWaitTime(gameMode: GameMode): number {
    // Simple estimation based on queue size
    const queueSize = this.getQueueSize(gameMode);
    if (queueSize < 2) {
      return 60; // 1 minute
    }
    return Math.max(10, 60 - (queueSize - 2) * 5);
  }

  /**
   * Get queue size for a game mode
   */
  private getQueueSize(gameMode: GameMode): number {
    let count = 0;
    for (const entry of queue.values()) {
      if (entry.gameMode === gameMode) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get matchmaking statistics
   */
  async getStats(): Promise<MatchmakingStats> {
    let totalQueued = 0;
    let totalSearching = 0;
    const byGameMode: MatchmakingStats['byGameMode'] = {};

    // Initialize stats for each game mode
    for (const mode of Object.values(GameMode)) {
      byGameMode[mode] = {
        queued: 0,
        searching: 0,
        averageWaitTime: 0,
      };
    }

    for (const entry of queue.values()) {
      totalQueued++;
      totalSearching++;

      const modeStats = byGameMode[entry.gameMode];
      if (modeStats) {
        modeStats.queued++;
        modeStats.searching++;
        const elapsedTime = (Date.now() - entry.joinedAt.getTime()) / 1000;
        modeStats.averageWaitTime = (modeStats.averageWaitTime + elapsedTime) / modeStats.queued;
      }
    }

    return {
      totalQueued,
      totalSearching,
      matchesFound: matches.size,
      averageWaitTime: this.calculateAverageWaitTime(),
      byGameMode,
    };
  }

  /**
   * Calculate average wait time across all queues
   */
  private calculateAverageWaitTime(): number {
    let totalTime = 0;
    let count = 0;

    for (const entry of queue.values()) {
      const elapsedTime = (Date.now() - entry.joinedAt.getTime()) / 1000;
      totalTime += elapsedTime;
      count++;
    }

    return count > 0 ? totalTime / count : 0;
  }

  /**
   * Get a match by ID
   */
  async getMatch(matchId: string): Promise<MatchFound | null> {
    return matches.get(matchId) || null;
  }

  /**
   * Clean up stale queue entries (for future cron job)
   */
  cleanupStaleEntries(timeoutSeconds: number = 600): void {
    const now = Date.now();
    for (const [userId, entry] of queue) {
      const elapsed = (now - entry.joinedAt.getTime()) / 1000;
      if (elapsed > timeoutSeconds) {
        queue.delete(userId);
      }
    }
  }
}

// Export singleton instance
export const matchmakingService = new MatchmakingService();
