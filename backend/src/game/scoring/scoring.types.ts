// Scoring Types & Constants - Trick -> Set -> Match hierarchy
// Per RULEBOOK.md Sections 8, 9 & 10

import { RoundResult, SpecialOutcome } from '../../engine/engine.types';

/**
 * Scoring constants — single source of truth for the Trick->Set->Match hierarchy.
 * Per RULEBOOK.md Section 9.
 */
export const ScoringConstants = {
  /** Tricks available in one Set/Round (52 cards ÷ 4 players) */
  TRICKS_PER_ROUND: 13,
  /** Tricks a team needs to win one Set/Round */
  TRICKS_TO_WIN_ROUND: 7,
  /** Sets a team needs to win the Match */
  SETS_TO_WIN_MATCH: 7,
} as const;

/**
 * Result of a single Trick — the 4-card cycle.
 * Per RULEBOOK.md Section 8: won by the team of the player who played
 * the highest card of the led suit (or the highest trump in classic Hokm).
 */
export interface TrickResult {
  trickNumber: number; // 0-12 within the current round
  winningTeamId: number; // 0 or 1
  winningCardId?: string; // The card that won the trick
  completedAt: Date;
}

/**
 * Complete match scoreboard.
 * Tracks trick progress within the current round plus Set totals across
 * all completed rounds, so the ScoringService is self-contained when
 * evaluating Trick -> Set -> Match transitions.
 */
export interface MatchScore {
  matchId: string;
  /** Tricks won by team 0 in the current round */
  tricksWonTeam0: number;
  /** Tricks won by team 1 in the current round */
  tricksWonTeam1: number;
  /** Total Sets won by team 0 in the match */
  setsWonTeam0: number;
  /** Total Sets won by team 1 in the match */
  setsWonTeam1: number;
  /** History of completed Set/Round results */
  rounds: RoundResult[];
  /** History of completed tricks in the current round */
  tricks: TrickResult[];
  winnerTeamId: number | null;
  isComplete: boolean;
}

// Re-export the authoritative types so scoring consumers import from one place
export type { RoundResult, SpecialOutcome };
