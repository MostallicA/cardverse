// Engine Layer - Game Persistence Service
// Persists and restores MatchState to/from the database via Prisma.
// Falls back to in-memory storage when the database is unavailable.

import { prisma } from '../db/prisma.js';

import { MatchState, EngineStatus } from './engine.types.js';

/**
 * GamePersistenceService
 *
 * Responsible for:
 * - Saving a MatchState to the database (Session + Match + MatchPlayer rows)
 * - Loading a MatchState from the database
 * - Falling back to in-memory storage when the database is unreachable
 */
export class GamePersistenceService {
  private memoryStore: Map<string, MatchState> = new Map();
  private dbAvailable: boolean = true;

  /**
   * Marks the database as unavailable and switches to memory fallback.
   */
  private setDbUnavailable(): void {
    if (this.dbAvailable) {
      this.dbAvailable = false;
      console.warn('[GamePersistence] Database unavailable - switching to in-memory fallback');
    }
  }

  /**
   * Attempts to restore the database connection flag.
   * Called on each successful DB operation.
   */
  private markDbAvailable(): void {
    if (!this.dbAvailable) {
      this.dbAvailable = true;
      console.log('[GamePersistence] Database connection restored');
    }
  }

  /**
   * Saves a match state to the database.
   * Falls back to memory if the database is unreachable.
   */
  async saveMatchState(matchState: MatchState): Promise<void> {
    // Always keep an in-memory copy as a fast-path cache
    this.memoryStore.set(matchState.matchId, matchState);

    if (!this.dbAvailable) {
      return; // DB is down — memory fallback only
    }

    try {
      const hostPlayer = matchState.players[0];
      const sessionId = `session_${matchState.matchId}`;

      // Upsert Session
      await prisma.session.upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          userId: hostPlayer?.userId ?? 'unknown',
          status: matchState.status === EngineStatus.COMPLETED ? 'completed' : 'active',
        },
        update: {
          status: matchState.status === EngineStatus.COMPLETED ? 'completed' : 'active',
        },
      });

      // Upsert Match
      await prisma.match.upsert({
        where: { sessionId },
        create: {
          id: matchState.matchId,
          sessionId,
          gameMode: matchState.config.mode,
          status: matchState.status,
          winnerTeam: matchState.teams.find((t) => t.setsWon > 0)?.id ?? null,
          state: matchState as unknown as object,
          startedAt: matchState.startedAt,
          completedAt: matchState.completedAt,
        },
        update: {
          gameMode: matchState.config.mode,
          status: matchState.status,
          winnerTeam: matchState.teams.find((t) => t.setsWon > 0)?.id ?? null,
          state: matchState as unknown as object,
          startedAt: matchState.startedAt,
          completedAt: matchState.completedAt,
        },
      });

      // Upsert match players
      // NOTE: we persist ONLY real human players. Bot players have a synthetic
      // `userId` (e.g. `bot_match_...`) that does NOT exist in the `users` table,
      // so persisting them would violate `MatchPlayer.userId -> User.id` FK.
      for (const player of matchState.players) {
        if (player.isBot) {
          continue; // bots have no real account — skip to avoid FK violation
        }
        await prisma.matchPlayer.upsert({
          where: {
            matchId_userId: {
              matchId: matchState.matchId,
              userId: player.userId,
            },
          },
          create: {
            matchId: matchState.matchId,
            sessionId,
            userId: player.userId,
            seatIndex: player.seatIndex,
            teamId: player.teamId,
            isBot: player.isBot,
            isWinner: false,
          },
          update: {
            seatIndex: player.seatIndex,
            teamId: player.teamId,
            isBot: player.isBot,
          },
        });
      }

      this.markDbAvailable();
    } catch (error) {
      this.setDbUnavailable();
      console.error('[GamePersistence] Failed to save match state:', error);
    }
  }

  /**
   * Loads a match state from the database.
   * Falls back to memory if the database is unreachable or the match is not found.
   */
  async loadMatchState(matchId: string): Promise<MatchState | undefined> {
    // Fast path: return from memory if present
    const cached = this.memoryStore.get(matchId);
    if (cached) {
      return cached;
    }

    if (!this.dbAvailable) {
      return undefined;
    }

    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match || !match.state) {
        return undefined;
      }

      const restored = match.state as unknown as MatchState;
      this.memoryStore.set(matchId, restored);
      this.markDbAvailable();
      return restored;
    } catch (error) {
      this.setDbUnavailable();
      console.warn('[GamePersistence] Failed to load match state:', error);
      return this.memoryStore.get(matchId);
    }
  }

  /**
   * Deletes a match state from both memory and database.
   */
  async deleteMatchState(matchId: string): Promise<void> {
    this.memoryStore.delete(matchId);

    if (!this.dbAvailable) {
      return;
    }

    try {
      await prisma.matchPlayer.deleteMany({ where: { matchId } });
      await prisma.match.delete({ where: { id: matchId } });
      await prisma.session.deleteMany({ where: { match: { id: matchId } } });
      this.markDbAvailable();
    } catch (error) {
      this.setDbUnavailable();
      console.warn('[GamePersistence] Failed to delete match state:', error);
    }
  }

  /**
   * Returns whether the database is currently available.
   */
  isDatabaseAvailable(): boolean {
    return this.dbAvailable;
  }
}

// Export singleton instance
export const gamePersistenceService = new GamePersistenceService();
