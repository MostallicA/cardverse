// Rule Executor - Implements Hokm rules per RULEBOOK.md

import { Card, Suit, Rank, GameMode, SpecialOutcome } from '../../engine/engine.types.js';

export class RuleExecutor {
  /**
   * Determines if a card is a valid play based on follow-suit rules
   */
  isValidPlay(
    card: Card,
    hand: Card[],
    leadSuit: Suit | undefined,

    _gameMode: GameMode,

    _trumpSuit?: Suit
  ): boolean {
    // If no lead suit (first card of trick), any card is valid
    if (!leadSuit) return true;

    // If player has the lead suit, they must play it
    const hasLeadSuit = hand.some((c) => c.suit === leadSuit);
    if (hasLeadSuit) {
      return card.suit === leadSuit;
    }

    // Player doesn't have lead suit - can play any card
    // In classic Hokm with trump, they may cut with trump
    // In non-trump modes (Saras/Nars/Tak Nars), they can discard anything
    return true;
  }

  /**
   * Gets the rank of a card for a specific game mode
   */
  getCardRank(card: Card, gameMode: GameMode): number {
    const rankOrder = this.getRankOrder(gameMode);
    return rankOrder[card.rank] ?? 0;
  }

  /**
   * Gets the rank ordering for a specific game mode
   * Per RULEBOOK.md Section 7
   */
  private getRankOrder(gameMode: GameMode): Record<Rank, number> {
    switch (gameMode) {
      case GameMode.HOKM:
      case GameMode.SARAS:
        // Classic order: A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2
        return {
          [Rank.ACE]: 13,
          [Rank.KING]: 12,
          [Rank.QUEEN]: 11,
          [Rank.JACK]: 10,
          [Rank.TEN]: 9,
          [Rank.NINE]: 8,
          [Rank.EIGHT]: 7,
          [Rank.SEVEN]: 6,
          [Rank.SIX]: 5,
          [Rank.FIVE]: 4,
          [Rank.FOUR]: 3,
          [Rank.THREE]: 2,
          [Rank.TWO]: 1,
        };

      case GameMode.NARAS:
        // Reversed order: 2 > 3 > 4 > ... > Q > K > A
        return {
          [Rank.TWO]: 13,
          [Rank.THREE]: 12,
          [Rank.FOUR]: 11,
          [Rank.FIVE]: 10,
          [Rank.SIX]: 9,
          [Rank.SEVEN]: 8,
          [Rank.EIGHT]: 7,
          [Rank.NINE]: 6,
          [Rank.TEN]: 5,
          [Rank.JACK]: 4,
          [Rank.QUEEN]: 3,
          [Rank.KING]: 2,
          [Rank.ACE]: 1,
        };

      case GameMode.TAK_NARAS:
        // Tak Nars: A > 2 > 3 > 4 > ... > Q > K
        return {
          [Rank.ACE]: 13,
          [Rank.TWO]: 12,
          [Rank.THREE]: 11,
          [Rank.FOUR]: 10,
          [Rank.FIVE]: 9,
          [Rank.SIX]: 8,
          [Rank.SEVEN]: 7,
          [Rank.EIGHT]: 6,
          [Rank.NINE]: 5,
          [Rank.TEN]: 4,
          [Rank.JACK]: 3,
          [Rank.QUEEN]: 2,
          [Rank.KING]: 1,
        };

      default:
        throw new Error(`Unknown game mode: ${gameMode}`);
    }
  }

  /**
   * Determines the winner of a trick
   * Per RULEBOOK.md Section 8
   */
  getTrickWinner(
    cards: Card[],
    playerIds: string[],
    leadSuit: Suit,
    gameMode: GameMode,
    trumpSuit?: Suit
  ): { winnerId: string; winningCard: Card } {
    if (cards.length !== 4) {
      throw new Error('A trick must have exactly 4 cards');
    }

    let highestRank = -1;
    let winnerIndex = 0;
    let winningCard = cards[0];

    // Check if trump exists (only in HOKM mode)
    const hasTrump = gameMode === GameMode.HOKM && trumpSuit !== undefined;
    const trumpCards = hasTrump ? cards.filter((c) => c.suit === trumpSuit) : [];

    // If trump cards exist, winner is highest trump card
    if (hasTrump && trumpCards.length > 0) {
      const rankOrder = this.getRankOrder(GameMode.HOKM);
      for (const card of trumpCards) {
        const rank = rankOrder[card.rank] ?? 0;
        if (rank > highestRank) {
          highestRank = rank;
          winningCard = card;
          winnerIndex = cards.indexOf(card);
        }
      }
    } else {
      // No trump - winner is highest card of lead suit
      const suitCards = cards.filter((c) => c.suit === leadSuit);
      const rankOrder = this.getRankOrder(gameMode);

      for (const card of suitCards) {
        const rank = rankOrder[card.rank] ?? 0;
        if (rank > highestRank) {
          highestRank = rank;
          winningCard = card;
          winnerIndex = cards.indexOf(card);
        }
      }
    }

    return {
      winnerId: playerIds[winnerIndex],
      winningCard,
    };
  }

  /**
   * Determines if a round has been won (7 tricks reached)
   * Per RULEBOOK.md Section 9
   */
  isRoundComplete(tricksWonTeam0: number, tricksWonTeam1: number): boolean {
    return tricksWonTeam0 >= 7 || tricksWonTeam1 >= 7;
  }

  /**
   * Determines the special outcome of a round
   * Per RULEBOOK.md Section 10
   */
  getRoundOutcome(
    tricksWonTeam0: number,
    tricksWonTeam1: number,
    hakemTeamId: number
  ): { outcome: SpecialOutcome; setsAwarded: number; winningTeamId: number } {
    const totalTricks = tricksWonTeam0 + tricksWonTeam1;

    // BAM: 13-0 (all tricks won)
    if (totalTricks === 13 && (tricksWonTeam0 === 13 || tricksWonTeam1 === 13)) {
      const winningTeamId = tricksWonTeam0 === 13 ? 0 : 1;
      return {
        outcome: SpecialOutcome.BAM,
        setsAwarded: 0, // BAM ends the match immediately
        winningTeamId,
      };
    }

    // Check if round is complete (7 tricks won)
    if (!this.isRoundComplete(tricksWonTeam0, tricksWonTeam1)) {
      throw new Error('Round is not complete');
    }

    const winningTeamId = tricksWonTeam0 >= 7 ? 0 : 1;
    const losingTeamId = 1 - winningTeamId;
    const losingTeamTricks = losingTeamId === 0 ? tricksWonTeam0 : tricksWonTeam1;

    // Kooti: 7-0 (losing team wins 0 tricks)
    if (losingTeamTricks === 0) {
      // Hakem Kooti: Hakem's team loses 7-0
      if (winningTeamId !== hakemTeamId) {
        return {
          outcome: SpecialOutcome.HAKEM_KOOTI,
          setsAwarded: 3,
          winningTeamId,
        };
      }
      // Regular Kooti: Hakem's team wins 7-0
      return {
        outcome: SpecialOutcome.KOOTI,
        setsAwarded: 2,
        winningTeamId,
      };
    }

    // Normal win
    return {
      outcome: SpecialOutcome.NORMAL,
      setsAwarded: 1,
      winningTeamId,
    };
  }

  /**
   * Determines the next Hakem based on round result
   * Per RULEBOOK.md Section 11
   */
  getNextHakem(
    currentHakemId: string,
    playerIds: string[],
    winningTeamId: number,
    hakemTeamId: number
  ): string {
    // If Hakem's team won, same Hakem stays
    if (winningTeamId === hakemTeamId) {
      return currentHakemId;
    }

    // If Hakem's team lost, pass to player counter-clockwise (right in seating order)
    const currentIndex = playerIds.indexOf(currentHakemId);
    if (currentIndex === -1) {
      throw new Error('Hakem not found in player list');
    }

    // Counter-clockwise = index + 1 (with wrap-around)
    const nextIndex = (currentIndex + 1) % playerIds.length;
    return playerIds[nextIndex];
  }

  /**
   * Checks if a match is complete (7 sets won)
   * Per RULEBOOK.md Section 9
   */
  isMatchComplete(setsWonTeam0: number, setsWonTeam1: number): boolean {
    return setsWonTeam0 >= 7 || setsWonTeam1 >= 7;
  }

  /**
   * Gets the winning team of a match
   */
  getMatchWinner(setsWonTeam0: number, setsWonTeam1: number): number {
    if (setsWonTeam0 >= 7) return 0;
    if (setsWonTeam1 >= 7) return 1;
    throw new Error('Match is not complete');
  }
}

// Export singleton instance
export const ruleExecutor = new RuleExecutor();
