// Rule Executor - Unit Tests
// Verifies the rule contract that the Scoring System relies on:
// trick resolution (Section 8), round/match completion (Section 9),
// special outcomes (Section 10) and Hakem rotation (Section 11).

/// <reference types="jest" />

import { Card, Suit, Rank, GameMode, SpecialOutcome } from '../../engine/engine.types.js';

import { ruleExecutor } from './rule.executor.js';

describe('RuleExecutor', () => {
  // Helper: build a Card quickly
  const card = (suit: Suit, rank: Rank): Card => ({
    suit,
    rank,
    id: `${rank}_${suit}`,
  });

  describe('getTrickWinner', () => {
    it('awards the trick to the highest card of the led suit', () => {
      const cards = [
        card(Suit.DEL, Rank.FIVE),
        card(Suit.DEL, Rank.KING),
        card(Suit.DEL, Rank.TWO),
        card(Suit.DEL, Rank.TEN),
      ];
      const playerIds = ['p1', 'p2', 'p3', 'p4'];

      const result = ruleExecutor.getTrickWinner(
        cards,
        playerIds,
        Suit.DEL,
        GameMode.HOKM,
        Suit.PIK // trump exists but no trump card was played
      );

      expect(result.winnerId).toBe('p2');
      expect(result.winningCard).toEqual(card(Suit.DEL, Rank.KING));
    });

    it('lets a trump card cut the led suit (classic Hokm)', () => {
      const cards = [
        card(Suit.DEL, Rank.TEN),
        card(Suit.DEL, Rank.ACE),
        card(Suit.PIK, Rank.SEVEN),
        card(Suit.KHAJ, Rank.TWO),
      ];
      const playerIds = ['p1', 'p2', 'p3', 'p4'];

      const result = ruleExecutor.getTrickWinner(
        cards,
        playerIds,
        Suit.DEL,
        GameMode.HOKM,
        Suit.PIK
      );

      expect(result.winnerId).toBe('p3');
      expect(result.winningCard).toEqual(card(Suit.PIK, Rank.SEVEN));
    });

    it('lets a higher trump beat a lower trump', () => {
      const cards = [
        card(Suit.DEL, Rank.TEN),
        card(Suit.PIK, Rank.TWO),
        card(Suit.PIK, Rank.KING),
        card(Suit.KHAJ, Rank.FIVE),
      ];
      const playerIds = ['p1', 'p2', 'p3', 'p4'];

      const result = ruleExecutor.getTrickWinner(
        cards,
        playerIds,
        Suit.DEL,
        GameMode.HOKM,
        Suit.PIK
      );

      expect(result.winnerId).toBe('p3');
      expect(result.winningCard).toEqual(card(Suit.PIK, Rank.KING));
    });

    it('never lets a discard win in Saras (no trump exists)', () => {
      const cards = [
        card(Suit.DEL, Rank.TEN),
        card(Suit.KHAJ, Rank.ACE), // discard - cannot win in Saras
        card(Suit.DEL, Rank.TWO),
        card(Suit.DEL, Rank.SEVEN),
      ];
      const playerIds = ['p1', 'p2', 'p3', 'p4'];

      const result = ruleExecutor.getTrickWinner(cards, playerIds, Suit.DEL, GameMode.SARAS);

      expect(result.winnerId).toBe('p1');
      expect(result.winningCard).toEqual(card(Suit.DEL, Rank.TEN));
    });

    it('uses the reversed rank order in Naras', () => {
      const cards = [
        card(Suit.DEL, Rank.ACE),
        card(Suit.DEL, Rank.TWO),
        card(Suit.DEL, Rank.KING),
        card(Suit.DEL, Rank.THREE),
      ];
      const playerIds = ['p1', 'p2', 'p3', 'p4'];

      const result = ruleExecutor.getTrickWinner(cards, playerIds, Suit.DEL, GameMode.NARAS);

      // In Naras: 2 > 3 > ... > K > A
      expect(result.winnerId).toBe('p2');
      expect(result.winningCard).toEqual(card(Suit.DEL, Rank.TWO));
    });

    it('throws when a trick does not contain exactly 4 cards', () => {
      expect(() =>
        ruleExecutor.getTrickWinner([card(Suit.DEL, Rank.ACE)], ['p1'], Suit.DEL, GameMode.HOKM)
      ).toThrow(/4 cards/);
    });
  });

  describe('isRoundComplete', () => {
    it('requires 7 tricks to complete a round', () => {
      expect(ruleExecutor.isRoundComplete(6, 6)).toBe(false);
      expect(ruleExecutor.isRoundComplete(7, 5)).toBe(true);
      expect(ruleExecutor.isRoundComplete(5, 7)).toBe(true);
    });
  });

  describe('getRoundOutcome', () => {
    it('throws while the round is still in progress', () => {
      expect(() => ruleExecutor.getRoundOutcome(6, 6, 0)).toThrow(/Round is not complete/);
    });

    it('resolves a normal win (7-6) to a single set', () => {
      const result = ruleExecutor.getRoundOutcome(7, 6, 0);

      expect(result.outcome).toBe(SpecialOutcome.NORMAL);
      expect(result.setsAwarded).toBe(1);
      expect(result.winningTeamId).toBe(0);
    });

    it('resolves Kooti when the Hakem team wins 7-0 (2 sets)', () => {
      const result = ruleExecutor.getRoundOutcome(7, 0, 0);

      expect(result.outcome).toBe(SpecialOutcome.KOOTI);
      expect(result.setsAwarded).toBe(2);
      expect(result.winningTeamId).toBe(0);
    });

    it('resolves Hakem Kooti when the Hakem team loses 7-0 (3 sets)', () => {
      const result = ruleExecutor.getRoundOutcome(0, 7, 0);

      expect(result.outcome).toBe(SpecialOutcome.HAKEM_KOOTI);
      expect(result.setsAwarded).toBe(3);
      expect(result.winningTeamId).toBe(1);
    });

    it('resolves Bam when a team wins all 13 tricks', () => {
      const result = ruleExecutor.getRoundOutcome(13, 0, 0);

      expect(result.outcome).toBe(SpecialOutcome.BAM);
      expect(result.setsAwarded).toBe(0); // Bam ends the Match directly
      expect(result.winningTeamId).toBe(0);
    });
  });

  describe('isMatchComplete / getMatchWinner', () => {
    it('requires 7 sets to complete a match', () => {
      expect(ruleExecutor.isMatchComplete(6, 6)).toBe(false);
      expect(ruleExecutor.isMatchComplete(7, 2)).toBe(true);
      expect(ruleExecutor.isMatchComplete(1, 7)).toBe(true);
    });

    it('returns the first team to 7 sets as the match winner', () => {
      expect(ruleExecutor.getMatchWinner(7, 3)).toBe(0);
      expect(ruleExecutor.getMatchWinner(2, 7)).toBe(1);
    });

    it('throws when the match is not complete', () => {
      expect(() => ruleExecutor.getMatchWinner(3, 4)).toThrow(/Match is not complete/);
    });
  });

  describe('getNextHakem', () => {
    // Seat order around the table; counter-clockwise = next index (with wrap).
    const players = ['p1', 'p2', 'p3', 'p4'];

    it('keeps the same Hakem when the Hakem team wins the round', () => {
      const next = ruleExecutor.getNextHakem('p2', players, 0, 0);

      expect(next).toBe('p2');
    });

    it('passes the Hakem role counter-clockwise when the Hakem team loses', () => {
      // Hakem team lost (winningTeamId=0, hakemTeamId=1): p2 -> p3.
      const next = ruleExecutor.getNextHakem('p2', players, 0, 1);

      expect(next).toBe('p3');
    });

    it('wraps around at the end of the seat order', () => {
      // p4 is last in seat order; counter-clockwise next is p1.
      const next = ruleExecutor.getNextHakem('p4', players, 0, 1);

      expect(next).toBe('p1');
    });

    it('throws when the current Hakem is not in the player list', () => {
      expect(() => ruleExecutor.getNextHakem('unknown', players, 0, 1)).toThrow(/Hakem not found/);
    });
  });
});
