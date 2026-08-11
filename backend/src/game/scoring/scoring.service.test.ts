// Scoring Service - Unit Tests
// Covers RULEBOOK.md Sections 8, 9 & 10 (Trick -> Set -> Match)

/// <reference types="jest" />

import {
  SpecialOutcome,
  MatchState,
  EngineStatus,
  GameMode,
  Team,
} from '../../engine/engine.types';

import { ScoringService } from './scoring.service';
import { ScoringConstants } from './scoring.types';

// Mock the database so match completion does not hit PostgreSQL.
jest.mock('../../db/prisma', () => ({
  prisma: {
    match: {
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe('ScoringService', () => {
  let svc: ScoringService;

  beforeEach(() => {
    svc = new ScoringService();
  });

  const initializeMatch = (matchId: string): void => {
    svc.initializeMatch(matchId);
  };

  /** Plays t0 tricks for team 0 and t1 tricks for team 1 in the current round. */
  const playTricks = (matchId: string, t0: number, t1: number): void => {
    for (let i = 0; i < t0; i++) {
      svc.recordTrick(matchId, 0);
    }
    for (let i = 0; i < t1; i++) {
      svc.recordTrick(matchId, 1);
    }
  };

  /** Plays a full normal round (7-6) and advances to the next round. */
  const playNormalRound = (matchId: string, winningTeamId: number): void => {
    playTricks(matchId, winningTeamId === 0 ? 7 : 6, winningTeamId === 0 ? 6 : 7);
    const result = svc.evaluateRound(matchId, { hakemId: 'hakem-1', nextHakemId: 'hakem-1' }, 0);
    expect(result).not.toBeNull();
    svc.startNextRound(matchId);
  };

  const buildMatchState = (matchId: string): MatchState => {
    const team = (id: number, setsWon: number, tricksWon: number): Team => ({
      id,
      players: [],
      setsWon,
      tricksWon,
    });

    return {
      matchId,
      status: EngineStatus.PLAYING,
      config: {
        mode: GameMode.HOKM,
        totalSetsToWin: 7,
        turnTimeoutMs: 8000,
        declarationTimeoutMs: 20000,
      },
      teams: [team(0, 4, 6), team(1, 2, 7)],
      players: [],
      currentSet: 4,
      currentTrickIndex: 0,
      tricks: [],
      hakemId: 'hakem-1',
      hakemTeamId: 0,
      handCards: {},
      isComplete: false,
    };
  };

  it('tracks initialized matches', () => {
    expect(svc.hasMatch('m-x')).toBe(false);
    svc.initializeMatch('m-x');
    expect(svc.hasMatch('m-x')).toBe(true);
  });

  it('tracks trick totals and trick history', () => {
    initializeMatch('m-trick');
    svc.recordTrick('m-trick', 0, 'card-1');
    svc.recordTrick('m-trick', 1);
    svc.recordTrick('m-trick', 0);

    expect(svc.getTricksWon('m-trick')).toEqual({ team0: 2, team1: 1 });
    const history = svc.getTrickHistory('m-trick');
    expect(history).toHaveLength(3);
    expect(history.map((t) => t.trickNumber)).toEqual([0, 1, 2]);
    expect(history[0].winningCardId).toBe('card-1');
  });

  it('rejects a trick beyond the 13-trick round capacity', () => {
    initializeMatch('m-cap');
    playTricks('m-cap', 13, 0);

    expect(() => svc.recordTrick('m-cap', 0)).toThrow(
      new RegExp(`all ${ScoringConstants.TRICKS_PER_ROUND} tricks`)
    );
  });

  it('rejects an invalid winning team id', () => {
    initializeMatch('m-team');
    expect(() => svc.recordTrick('m-team', 5)).toThrow(/Invalid winning team id/);
  });

  it('returns null from evaluateRound while the round is in progress', () => {
    initializeMatch('m-open');
    playTricks('m-open', 6, 4);

    expect(svc.evaluateRound('m-open', { hakemId: 'h', nextHakemId: 'h' }, 0)).toBeNull();
  });

  it('records a normal round win as 1 set', () => {
    initializeMatch('m-normal');
    playTricks('m-normal', 7, 6);

    const result = svc.evaluateRound('m-normal', { hakemId: 'hakem-1', nextHakemId: 'hakem-1' }, 0);

    expect(result).not.toBeNull();
    expect(result!.outcome).toBe(SpecialOutcome.NORMAL);
    expect(result!.winningTeamId).toBe(0);
    expect(result!.setsAwarded).toBe(1);
    expect(svc.getSetScore('m-normal')).toEqual({ team0: 1, team1: 0 });
    expect(svc.getMatchScore('m-normal')!.isComplete).toBe(false);
  });

  it('awards 2 sets for Kooti (Hakem team wins 7-0)', () => {
    initializeMatch('m-kooti');
    playTricks('m-kooti', 7, 0);

    const result = svc.evaluateRound('m-kooti', { hakemId: 'hakem-1', nextHakemId: 'hakem-2' }, 0);

    expect(result!.outcome).toBe(SpecialOutcome.KOOTI);
    expect(result!.setsAwarded).toBe(2);
    expect(svc.getSetScore('m-kooti')).toEqual({ team0: 2, team1: 0 });
  });

  it('awards 3 sets for Hakem Kooti (Hakem team loses 7-0)', () => {
    initializeMatch('m-hakem-kooti');
    playTricks('m-hakem-kooti', 0, 7);

    const result = svc.evaluateRound(
      'm-hakem-kooti',
      { hakemId: 'hakem-1', nextHakemId: 'hakem-1' },
      0
    );

    expect(result!.outcome).toBe(SpecialOutcome.HAKEM_KOOTI);
    expect(result!.setsAwarded).toBe(3);
    expect(svc.getSetScore('m-hakem-kooti')).toEqual({ team0: 0, team1: 3 });
  });

  it('completes the match when a team reaches 7 sets', () => {
    initializeMatch('m-7sets');
    for (let round = 1; round <= 6; round++) {
      playNormalRound('m-7sets', 0);
    }
    expect(svc.getMatchScore('m-7sets')!.isComplete).toBe(false);

    playNormalRound('m-7sets', 0);

    const score = svc.getMatchScore('m-7sets')!;
    expect(score.isComplete).toBe(true);
    expect(score.winnerTeamId).toBe(0);
    expect(svc.getRoundHistory('m-7sets')).toHaveLength(7);
  });

  it('ends the match immediately on Bam regardless of prior Set totals', () => {
    initializeMatch('m-bam');

    // Team 0 wins 5 sets, team 1 wins 6 sets - neither has reached 7 yet.
    for (let i = 0; i < 5; i++) {
      playNormalRound('m-bam', 0);
    }
    for (let i = 0; i < 6; i++) {
      playNormalRound('m-bam', 1);
    }
    expect(svc.getMatchScore('m-bam')!.isComplete).toBe(false);
    expect(svc.getSetScore('m-bam')).toEqual({ team0: 5, team1: 6 });

    // Bam: team 0 wins all 13 tricks of the round.
    playTricks('m-bam', 13, 0);
    const result = svc.evaluateRound('m-bam', { hakemId: 'hakem-1', nextHakemId: 'hakem-1' }, 0);

    expect(result!.outcome).toBe(SpecialOutcome.BAM);
    const score = svc.getMatchScore('m-bam')!;
    expect(score.isComplete).toBe(true);
    expect(score.winnerTeamId).toBe(0);
    // Bam awards no Set points - the scoreboard keeps its prior totals.
    expect(svc.getSetScore('m-bam')).toEqual({ team0: 5, team1: 6 });
  });

  it('rejects recording a round after the match is complete', () => {
    initializeMatch('m-done');
    for (let i = 0; i < 7; i++) {
      playNormalRound('m-done', 0);
    }

    expect(() =>
      svc.recordRound('m-done', {
        roundNumber: 8,
        winningTeamId: 0,
        setsAwarded: 1,
        outcome: SpecialOutcome.NORMAL,
        hakemId: 'h',
        nextHakemId: 'h',
      })
    ).toThrow(/already complete/);
  });

  it('rejects out-of-order round numbers', () => {
    initializeMatch('m-order');

    expect(() =>
      svc.recordRound('m-order', {
        roundNumber: 2,
        winningTeamId: 0,
        setsAwarded: 1,
        outcome: SpecialOutcome.NORMAL,
        hakemId: 'h',
        nextHakemId: 'h',
      })
    ).toThrow(/expected 1/);
  });

  it('resets trick trackers when starting the next round', () => {
    initializeMatch('m-reset');
    playTricks('m-reset', 4, 3);

    svc.startNextRound('m-reset');

    expect(svc.getTricksWon('m-reset')).toEqual({ team0: 0, team1: 0 });
    expect(svc.getTrickHistory('m-reset')).toHaveLength(0);
  });

  it('rebuilds the scoreboard from a persisted MatchState', () => {
    const state = buildMatchState('m-restore');
    svc.restoreFromMatchState(state);

    const score = svc.getMatchScore('m-restore')!;
    expect(score.tricksWonTeam0).toBe(6);
    expect(score.tricksWonTeam1).toBe(7);
    expect(svc.getSetScore('m-restore')).toEqual({ team0: 4, team1: 2 });
    expect(score.isComplete).toBe(false);
    expect(score.winnerTeamId).toBeNull();
  });

  it('detects the winner when restoring a completed match', () => {
    const state = buildMatchState('m-restore-done');
    state.teams[0].setsWon = 7;
    state.isComplete = true;

    svc.restoreFromMatchState(state);

    const score = svc.getMatchScore('m-restore-done')!;
    expect(score.isComplete).toBe(true);
    expect(score.winnerTeamId).toBe(0);
  });
});
