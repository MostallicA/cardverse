// Bot Manager - Manages AI bot players for matches
// Per ARCHITECTURE.md Section 3.2 and RULEBOOK.md Section 13

import { Player, Card, Suit, MatchState, BotConfig, GameMode } from '../../engine/engine.types.js';

export interface BotManagerConfig {
  defaultDifficulty: 'basic' | 'advanced';
  grayscaleAvatar: boolean;
}

export class BotManager {
  private config: BotManagerConfig;
  private botSeats: Map<string, { matchId: string; playerId: string; seatIndex: number }> =
    new Map();

  constructor(config: BotManagerConfig) {
    this.config = config;
  }

  /**
   * Creates a bot player
   */
  createBot(
    matchId: string,
    userId: string,
    username: string,
    seatIndex: number,
    teamId: number
  ): Player {
    const bot: Player = {
      id: `bot_${userId}_${Date.now()}`,
      userId,
      username: username, // invisible bot (per RULEBOOK §13.4)
      seatIndex,
      teamId,
      isActive: true,
      isBot: true,
      consecutiveMisses: 0,
    };

    // Store bot seat info
    this.botSeats.set(bot.id, {
      matchId,
      playerId: bot.id,
      seatIndex,
    });

    return bot;
  }

  /**
   * Gets a bot's avatar configuration
   * Per RULEBOOK.md Section 13.4: bots must be invisible — no grayscale avatar
   */
  getBotAvatarConfig(_playerId: string): BotConfig {
    return {
      difficulty: this.config.defaultDifficulty,
      grayscaleAvatar: false, // Bots are invisible per RULEBOOK.md §13.4
    };
  }

  /**
   * Checks if a player is a bot
   */
  isBot(playerId: string): boolean {
    return this.botSeats.has(playerId);
  }

  /**
   * Gets the match ID for a bot
   */
  getBotMatch(playerId: string): string | undefined {
    const info = this.botSeats.get(playerId);
    return info?.matchId;
  }

  /**
   * Removes a bot from a match (when a player reconnects)
   */
  removeBot(matchId: string, playerId: string): void {
    const botInfo = this.botSeats.get(playerId);
    if (botInfo && botInfo.matchId === matchId) {
      this.botSeats.delete(playerId);
      console.log(`[BotManager] Bot ${playerId} removed from match ${matchId}`);
    }
  }

  /**
   * Makes a bot play a card
   * Basic bot: plays a random valid card
   * Per RULEBOOK.md Section 13: "basic rule-following bot (always plays a legal card)"
   */
  playCard(
    match: MatchState,
    playerId: string,
    leadSuit?: Suit
  ): { card: Card; cardId: string } | null {
    // Get bot's hand
    const hand = match.handCards[playerId];
    if (!hand || hand.length === 0) {
      return null;
    }

    // Get valid cards for this bot
    const validCards = this.getValidCards(
      hand,
      leadSuit,
      match.config.mode,
      match.config.trumpSuit
    );

    if (validCards.length === 0) {
      // If no valid cards (shouldn't happen), play first card
      return {
        card: hand[0],
        cardId: hand[0].id,
      };
    }

    // Basic strategy: play a random valid card
    // Advanced strategy (deferred per RULEBOOK.md Section 13) would consider:
    // - Not overplaying when partner is winning
    // - Playing strategically to win tricks
    // - Tracking which cards have been played
    const randomIndex = Math.floor(Math.random() * validCards.length);
    const selectedCard = validCards[randomIndex];

    return {
      card: selectedCard,
      cardId: selectedCard.id,
    };
  }

  /**
   * Gets valid cards for a bot based on follow-suit rules
   * Per RULEBOOK.md Section 8
   */
  private getValidCards(
    hand: Card[],
    leadSuit: Suit | undefined,
    gameMode: GameMode,
    trumpSuit?: Suit
  ): Card[] {
    // If no lead suit (first card of trick), all cards are valid
    if (!leadSuit) {
      return [...hand];
    }

    // Check if player has the lead suit
    const hasLeadSuit = hand.some((c) => c.suit === leadSuit);

    if (hasLeadSuit) {
      // Must follow suit
      return hand.filter((c) => c.suit === leadSuit);
    }

    // Player doesn't have lead suit
    // In classic Hokm with trump, can cut with trump
    if (gameMode === GameMode.HOKM && trumpSuit) {
      const trumpCards = hand.filter((c) => c.suit === trumpSuit);
      if (trumpCards.length > 0) {
        // Can cut with trump - prefer lower trump to save higher ones
        // Basic strategy: play lowest trump
        return [this.getLowestCard(trumpCards, gameMode)];
      }
    }

    // No trump or no trump cards - discard any card
    // Basic strategy: play lowest card
    return [this.getLowestCard(hand, gameMode)];
  }

  /**
   * Gets the lowest card from a hand based on game mode ranking
   */
  private getLowestCard(cards: Card[], gameMode: GameMode): Card {
    let lowestCard = cards[0];
    let lowestRank = this.getCardRankValue(lowestCard, gameMode);

    for (let i = 1; i < cards.length; i++) {
      const rank = this.getCardRankValue(cards[i], gameMode);
      if (rank < lowestRank) {
        lowestRank = rank;
        lowestCard = cards[i];
      }
    }

    return lowestCard;
  }

  /**
   * Gets the numeric rank value for a card in a specific game mode
   */
  private getCardRankValue(card: Card, gameMode: GameMode): number {
    const rankOrder = this.getRankOrder(gameMode);
    return rankOrder[card.rank] ?? 0;
  }

  /**
   * Gets the rank ordering for a specific game mode
   * Per RULEBOOK.md Section 7
   */
  private getRankOrder(gameMode: GameMode): Record<string, number> {
    switch (gameMode) {
      case GameMode.HOKM:
      case GameMode.SARAS:
        return {
          ace: 13,
          king: 12,
          queen: 11,
          jack: 10,
          '10': 9,
          '9': 8,
          '8': 7,
          '7': 6,
          '6': 5,
          '5': 4,
          '4': 3,
          '3': 2,
          '2': 1,
        };

      case GameMode.NARAS:
        return {
          '2': 13,
          '3': 12,
          '4': 11,
          '5': 10,
          '6': 9,
          '7': 8,
          '8': 7,
          '9': 6,
          '10': 5,
          jack: 4,
          queen: 3,
          king: 2,
          ace: 1,
        };

      case GameMode.TAK_NARAS:
        return {
          ace: 13,
          '2': 12,
          '3': 11,
          '4': 10,
          '5': 9,
          '6': 8,
          '7': 7,
          '8': 6,
          '9': 5,
          '10': 4,
          jack: 3,
          queen: 2,
          king: 1,
        };

      default:
        throw new Error(`Unknown game mode: ${gameMode}`);
    }
  }

  /**
   * Checks if a bot should be removed from a match
   * (when the original player reconnects)
   */
  shouldRemoveBot(matchId: string, playerId: string): boolean {
    const botInfo = this.botSeats.get(playerId);
    return botInfo?.matchId === matchId;
  }

  /**
   * Gets all bot players in a match
   */
  getBotsInMatch(matchId: string): string[] {
    const botIds: string[] = [];
    for (const [botId, info] of this.botSeats) {
      if (info.matchId === matchId) {
        botIds.push(botId);
      }
    }
    return botIds;
  }

  /**
   * Counts the number of bots in a match
   */
  countBotsInMatch(matchId: string): number {
    let count = 0;
    for (const [, info] of this.botSeats) {
      if (info.matchId === matchId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Updates the bot configuration
   */
  updateConfig(config: Partial<BotManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): BotManagerConfig {
    return { ...this.config };
  }

  /**
   * Cleans up all bot data for a match
   */
  cleanupMatch(matchId: string): void {
    const toRemove: string[] = [];
    for (const [botId, info] of this.botSeats) {
      if (info.matchId === matchId) {
        toRemove.push(botId);
      }
    }
    for (const botId of toRemove) {
      this.botSeats.delete(botId);
    }
  }
}

// Export singleton instance with default config
export const botManager = new BotManager({
  defaultDifficulty: 'basic',
  grayscaleAvatar: false, // Bots are invisible per RULEBOOK.md §13.4
});
