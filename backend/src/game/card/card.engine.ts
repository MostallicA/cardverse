// Card Engine - Manages deck operations and card utilities

import { Card, Suit, Rank } from '../../engine/engine.types';

export class CardEngine {
  /**
   * Creates a standard 52-card deck
   */
  createDeck(): Card[] {
    const suits = [Suit.KHESHT, Suit.PIK, Suit.DEL, Suit.KHAJ];
    const ranks = [
      Rank.TWO,
      Rank.THREE,
      Rank.FOUR,
      Rank.FIVE,
      Rank.SIX,
      Rank.SEVEN,
      Rank.EIGHT,
      Rank.NINE,
      Rank.TEN,
      Rank.JACK,
      Rank.QUEEN,
      Rank.KING,
      Rank.ACE,
    ];

    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          id: `${rank}_${suit}`,
        });
      }
    }
    return deck;
  }

  /**
   * Shuffles a deck using Fisher-Yates algorithm
   */
  shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Deals cards to players (5+4+4 pattern per RULEBOOK.md)
   */
  dealCards(deck: Card[], numPlayers: number): Card[][] {
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
    const deckCopy = [...deck];

    // Phase 1: Deal 5 cards to each player
    for (let i = 0; i < numPlayers; i++) {
      const card = deckCopy.pop();
      if (card) hands[i].push(card);
    }
    for (let i = 0; i < numPlayers; i++) {
      const card = deckCopy.pop();
      if (card) hands[i].push(card);
    }
    for (let i = 0; i < numPlayers; i++) {
      const card = deckCopy.pop();
      if (card) hands[i].push(card);
    }
    for (let i = 0; i < numPlayers; i++) {
      const card = deckCopy.pop();
      if (card) hands[i].push(card);
    }
    for (let i = 0; i < numPlayers; i++) {
      const card = deckCopy.pop();
      if (card) hands[i].push(card);
    }

    // Phase 2: Deal 4 cards to each player (twice)
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < numPlayers; i++) {
        for (let j = 0; j < 4; j++) {
          const card = deckCopy.pop();
          if (card) hands[i].push(card);
        }
      }
    }

    return hands;
  }

  /**
   * Sorts cards by suit and rank (standard order)
   */
  sortCards(cards: Card[]): Card[] {
    const suitOrder = [Suit.KHESHT, Suit.PIK, Suit.DEL, Suit.KHAJ];
    const rankOrder = [
      Rank.ACE,
      Rank.KING,
      Rank.QUEEN,
      Rank.JACK,
      Rank.TEN,
      Rank.NINE,
      Rank.EIGHT,
      Rank.SEVEN,
      Rank.SIX,
      Rank.FIVE,
      Rank.FOUR,
      Rank.THREE,
      Rank.TWO,
    ];

    return [...cards].sort((a, b) => {
      const suitA = suitOrder.indexOf(a.suit);
      const suitB = suitOrder.indexOf(b.suit);
      if (suitA !== suitB) return suitA - suitB;
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
  }

  /**
   * Checks if a card exists in a hand
   */
  hasCard(hand: Card[], cardId: string): boolean {
    return hand.some((c) => c.id === cardId);
  }

  /**
   * Removes a card from a hand by ID
   */
  removeCard(hand: Card[], cardId: string): Card | undefined {
    const index = hand.findIndex((c) => c.id === cardId);
    if (index === -1) return undefined;
    const [removed] = hand.splice(index, 1);
    return removed;
  }

  /**
   * Gets cards of a specific suit from a hand
   */
  getCardsBySuit(hand: Card[], suit: Suit): Card[] {
    return hand.filter((c) => c.suit === suit);
  }

  /**
   * Gets cards of a specific rank from a hand
   */
  getCardsByRank(hand: Card[], rank: Rank): Card[] {
    return hand.filter((c) => c.rank === rank);
  }

  /**
   * Checks if a hand has any cards of a specific suit
   */
  hasSuit(hand: Card[], suit: Suit): boolean {
    return hand.some((c) => c.suit === suit);
  }
}

// Export singleton instance
export const cardEngine = new CardEngine();
