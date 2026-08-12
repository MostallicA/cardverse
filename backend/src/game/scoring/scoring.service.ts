// Scoring Service - Manages Trick -> Set -> Match scoring
// Per RULEBOOK.md Sections 8, 9 & 10

import { prisma } from '../../db/prisma.js';
import { ruleExecutor } from '../card/rule.executor.js';
import { MatchState, RoundResult, SpecialOutcome } from '../../engine/engine.types.js';

import { MatchScore, TrickResult, ScoringConstants } from './scoring.types.js';

export class ScoringService {
  private matchScores: Map<string, MatchScore> = new Map<string, MatchScore>();

  /**
   * Initializes scoring for a new match.
   */
  initializeMatch(matchId: string): MatchScore {
    const score: MatchScore = {
      matchId,
      tricksWonTeam0: 0,
      tricksWonTeam1: 0,
      setsWonTeam0: 0,
      setsWonTeam1: 0,
      rounds: [],
      tricks: [],
      winnerTeamId: null,
      isComplete: false,
    };
    this.matchScores.set(matchId, score);
    return score;
  }

  /**
   * Returns whether a match is tracked by the scoring service.
   */
  hasMatch(matchId: string): boolean {
    return this.matchScores.has(matchId);
  }

  /**
   * Registers a completed Trick (the 4-card cycle) in the current round.
   * Per RULEBOOK.md Section 8 the Trick is won by one team.
   * Throws if the match is already complete or the round has exceeded
   * its 13-trick capacity.
   */
  recordTrick(matchId: string, winningTeamId: number, winningCardId?: string): TrickResult {
    const score = this.getRequired(matchId);
    if (score.isComplete) {
      throw new Error(`Match ${matchId} is already complete`);
    }

    const trickNumber = score.tricks.length;
    if (trickNumber >= ScoringConstants.TRICKS_PER_ROUND) {
      throw new Error(`Round already has all ${ScoringConstants.TRICKS_PER_ROUND} tricks played`);
    }
    if (winningTeamId !== 0 && winningTeamId !== 1) {
      throw new Error(`Invalid winning team id: ${winningTeamId}`);
    }

    const trick: TrickResult = {
      trickNumber,
      winningTeamId,
      winningCardId,
      completedAt: new Date(),
    };

    if (winningTeamId === 0) {
      score.tricksWonTeam0 += 1;
    } else {
      score.tricksWonTeam1 += 1;
    }

    score.tricks.push(trick);
    return trick;
  }

  /**
   * Returns tricks won per team in the current round, or undefined when
   * the match is not tracked.
   */
  getTricksWon(matchId: string): { team0: number; team1: number } | undefined {
    const score = this.matchScores.get(matchId);
    if (!score) return undefined;
    return { team0: score.tricksWonTeam0, team1: score.tricksWonTeam1 };
  }

  /**
   * Evaluates whether the current round (Set) has ended and, if so,
   * resolves its outcome per RULEBOOK.md Section 10 and records it.
   * Returns the RoundResult, or null while the round is still in progress.
   */
  evaluateRound(
    matchId: string,
    meta: { hakemId: string; nextHakemId: string },
    hakemTeamId: number
  ): RoundResult | null {
    const score = this.getRequired(matchId);
    if (score.isComplete) {
      return null;
    }

    if (!ruleExecutor.isRoundComplete(score.tricksWonTeam0, score.tricksWonTeam1)) {
      return null;
    }

    const outcome = ruleExecutor.getRoundOutcome(
      score.tricksWonTeam0,
      score.tricksWonTeam1,
      hakemTeamId
    );

    return this.recordRound(matchId, {
      roundNumber: score.rounds.length + 1,
      winningTeamId: outcome.winningTeamId,
      setsAwarded: outcome.setsAwarded,
      outcome: outcome.outcome,
      hakemId: meta.hakemId,
      nextHakemId: meta.nextHakemId,
    });
  }

  /**
   * Records a completed round (Set) and updates the Match scoreboard.
   *
   * Per RULEBOOK.md Section 10:
   * - Normal win  -> 1 Set
   * - Kooti       -> 2 Sets (Hakem's team wins 7-0)
   * - Hakem Kooti -> 3 Sets (Hakem's team loses 7-0)
   * - Bam         -> Match ends immediately, regardless of prior Set scores
   *
   * A Match is won by the first team to accumulate 7 Sets (Section 9).
   */
  recordRound(matchId: string, roundResult: RoundResult): RoundResult {
    const score = this.getRequired(matchId);
    if (score.isComplete) {
      throw new Error(`Match ${matchId} is already complete`);
    }

    const expectedRound = score.rounds.length + 1;
    if (roundResult.roundNumber !== expectedRound) {
      throw new Error(
        `Unexpected round number ${roundResult.roundNumber}; expected ${expectedRound}`
      );
    }
    if (roundResult.winningTeamId !== 0 && roundResult.winningTeamId !== 1) {
      throw new Error(`Invalid winning team id: ${roundResult.winningTeamId}`);
    }

    // BAM: the Match ends immediately no matter the current Set totals.
    if (roundResult.outcome === SpecialOutcome.BAM) {
      score.isComplete = true;
      score.winnerTeamId = roundResult.winningTeamId;
    } else {
      if (roundResult.winningTeamId === 0) {
        score.setsWonTeam0 = Math.min(
          ScoringConstants.SETS_TO_WIN_MATCH,
          score.setsWonTeam0 + roundResult.setsAwarded
        );
      } else {
        score.setsWonTeam1 = Math.min(
          ScoringConstants.SETS_TO_WIN_MATCH,
          score.setsWonTeam1 + roundResult.setsAwarded
        );
      }

      if (
        score.setsWonTeam0 >= ScoringConstants.SETS_TO_WIN_MATCH ||
        score.setsWonTeam1 >= ScoringConstants.SETS_TO_WIN_MATCH
      ) {
        score.isComplete = true;
        score.winnerTeamId = score.setsWonTeam0 >= ScoringConstants.SETS_TO_WIN_MATCH ? 0 : 1;
      }
    }

    score.rounds.push(roundResult);

    if (score.isComplete) {
      void this.saveMatchResult(matchId, score);
    }

    return roundResult;
  }

  /**
   * Prepares scoring for the next round (Set): resets the trick trackers.
   */
  startNextRound(matchId: string): void {
    const score = this.getRequired(matchId);
    score.tricksWonTeam0 = 0;
    score.tricksWonTeam1 = 0;
    score.tricks = [];
  }

  /**
   * Returns the current Set tally for the match.
   */
  getSetScore(matchId: string): { team0: number; team1: number } | undefined {
    const score = this.matchScores.get(matchId);
    if (!score) return undefined;
    return { team0: score.setsWonTeam0, team1: score.setsWonTeam1 };
  }

  /**
   * Rebuilds the in-memory scoreboard for a match restored from the
   * database. Trick/Set totals are authoritative and carried inside
   * MatchState; the per-round history is not persisted in this version,
   * so it starts empty.
   */
  restoreFromMatchState(state: MatchState): MatchScore {
    const team0 = state.teams[0];
    const team1 = state.teams[1];

    const score: MatchScore = {
      matchId: state.matchId,
      tricksWonTeam0: team0?.tricksWon ?? 0,
      tricksWonTeam1: team1?.tricksWon ?? 0,
      setsWonTeam0: team0?.setsWon ?? 0,
      setsWonTeam1: team1?.setsWon ?? 0,
      rounds: [],
      tricks: [],
      winnerTeamId: state.isComplete
        ? ruleExecutor.getMatchWinner(team0?.setsWon ?? 0, team1?.setsWon ?? 0)
        : null,
      isComplete: state.isComplete,
    };
    this.matchScores.set(state.matchId, score);
    return score;
  }

  /**
   * Gets the current match score.
   */
  getMatchScore(matchId: string): MatchScore | undefined {
    return this.matchScores.get(matchId);
  }

  /**
   * Gets the history of completed rounds (Sets) for a match.
   */
  getRoundHistory(matchId: string): RoundResult[] {
    const score = this.matchScores.get(matchId);
    return score?.rounds || [];
  }

  /**
   * Gets the history of completed tricks in the current round.
   */
  getTrickHistory(matchId: string): TrickResult[] {
    const score = this.matchScores.get(matchId);
    return score?.tricks || [];
  }

  /**
   * Persists the final match result. Never throws — a database failure is
   * logged and tolerated so it cannot break the in-memory game flow.
   */
  private async saveMatchResult(matchId: string, score: MatchScore): Promise<void> {
    try {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'completed',
          winnerTeam: score.winnerTeamId,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[Scoring] Failed to save match result for ${matchId}:`, error);
    }
  }

  private getRequired(matchId: string): MatchScore {
    const score = this.matchScores.get(matchId);
    if (!score) {
      throw new Error(`Match ${matchId} not found in scoring service`);
    }
    return score;
  }
}

// Export singleton instance
export const scoringService = new ScoringService();
