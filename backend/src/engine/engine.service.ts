// Engine Layer - Main Service
// Manages the complete lifecycle of a Hokm match

import {
  EngineStatus,
  Suit,
  Rank,
  Card,
  Player,
  Team,
  MatchConfig,
  MatchState,
} from './engine.types';
import { gamePersistenceService } from './game-persistence.service';

export class EngineService {
  private matchStates: Map<string, MatchState> = new Map();
  private activeMatches: Set<string> = new Set();
  private persistenceEnabled: boolean = true;

  /**
   * Creates a new match with the given configuration
   */
  createMatch(
    matchId: string,
    players: Omit<Player, 'consecutiveMisses' | 'isBot'>[],
    config: MatchConfig
  ): MatchState {
    // Validate: exactly 4 players required
    if (players.length !== 4) {
      throw new Error('Hokm requires exactly 4 players');
    }

    // Create player objects with default values
    const playerObjects: Player[] = players.map((p) => ({
      ...p,
      consecutiveMisses: 0,
      isBot: false,
    }));

    // Assign teams: seats 0&2 = Team 0, seats 1&3 = Team 1 (opposite seating)
    const team0Players = playerObjects.filter((p) => p.seatIndex === 0 || p.seatIndex === 2);
    const team1Players = playerObjects.filter((p) => p.seatIndex === 1 || p.seatIndex === 3);

    const teams: Team[] = [
      {
        id: 0,
        players: team0Players,
        setsWon: 0,
        tricksWon: 0,
      },
      {
        id: 1,
        players: team1Players,
        setsWon: 0,
        tricksWon: 0,
      },
    ];

    // Select random Hakem for first round
    const randomIndex = Math.floor(Math.random() * playerObjects.length);
    const hakemId = playerObjects[randomIndex].id;

    // Create initial match state
    const matchState: MatchState = {
      matchId,
      status: EngineStatus.INITIALIZING,
      config,
      teams,
      players: playerObjects,
      currentSet: 0,
      currentTrickIndex: 0,
      tricks: [],
      hakemId,
      dealerId: hakemId, // Dealer is Hakem initially
      handCards: {},
      isComplete: false,
    };

    // Store match state
    this.matchStates.set(matchId, matchState);
    this.activeMatches.add(matchId);

    // Persist to database (fire-and-forget; falls back to memory if DB unavailable)
    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(matchState);
    }

    return matchState;
  }

  /**
   * Gets the current state of a match
   */
  getMatchState(matchId: string): MatchState | undefined {
    return this.matchStates.get(matchId);
  }

  /**
   * Loads a match state from the database (or memory fallback).
   * If found, it is restored into the in-memory store.
   */
  async loadMatchState(matchId: string): Promise<MatchState | undefined> {
    // Check memory first
    const cached = this.matchStates.get(matchId);
    if (cached) {
      return cached;
    }

    // Try to load from persistence layer
    const restored = await gamePersistenceService.loadMatchState(matchId);
    if (restored) {
      this.matchStates.set(matchId, restored);
      this.activeMatches.add(matchId);
    }
    return restored;
  }

  /**
   * Enables or disables database persistence.
   * When disabled, the engine operates purely in-memory.
   */
  setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  /**
   * Returns whether persistence is currently enabled.
   */
  isPersistenceEnabled(): boolean {
    return this.persistenceEnabled;
  }

  /**
   * Starts a match (moves from INITIALIZING to LOBBY)
   */
  startMatch(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    if (match.status !== EngineStatus.INITIALIZING) {
      throw new Error(`Match ${matchId} is not in INITIALIZING state`);
    }

    match.status = EngineStatus.LOBBY;
    match.startedAt = new Date();

    this.matchStates.set(matchId, match);

    // Persist updated state
    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Deals cards to all players (5+4+4 = 13 cards each)
   */
  dealCards(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    if (match.status !== EngineStatus.LOBBY && match.status !== EngineStatus.PLAYING) {
      throw new Error(`Match ${matchId} is not ready for dealing`);
    }

    // Create a full 52-card deck
    const deck = this.createDeck();

    // Shuffle the deck
    this.shuffleDeck(deck);

    // Deal 13 cards to each player
    const handCards: Record<string, Card[]> = {};
    const players = match.players;

    for (let i = 0; i < players.length; i++) {
      const playerId = players[i].id;
      const startIndex = i * 13;
      const endIndex = startIndex + 13;
      handCards[playerId] = deck.slice(startIndex, endIndex);
    }

    match.handCards = handCards;
    match.status = EngineStatus.PLAYING;
    match.currentTrickIndex = 0;
    match.tricks = [];

    // Reset tricks won for current set
    match.teams.forEach((team) => {
      team.tricksWon = 0;
    });

    this.matchStates.set(matchId, match);

    // Persist updated state
    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Creates a standard 52-card deck
   */
  private createDeck(): Card[] {
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
  private shuffleDeck(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * Places a card from a player's hand
   */
  playCard(matchId: string, playerId: string, cardId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    if (match.status !== EngineStatus.PLAYING) {
      throw new Error(`Match ${matchId} is not in PLAYING state`);
    }

    // Validate player exists and is active
    const player = match.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in match`);
    }

    if (!player.isActive) {
      throw new Error(`Player ${playerId} is not active`);
    }

    // Find card in player's hand
    const hand = match.handCards[playerId];
    if (!hand) {
      throw new Error(`Player ${playerId} has no cards`);
    }

    const cardIndex = hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found in player ${playerId}'s hand`);
    }

    // Remove card from hand
    hand.splice(cardIndex, 1); // Remove card without storing
    match.handCards[playerId] = hand;

    // Add to current trick
    // (Trick management will be handled by the Turn Manager)
    // This is a placeholder - full trick logic goes in turn manager

    this.matchStates.set(matchId, match);

    // Persist updated state
    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Ends a match
   */
  endMatch(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    match.status = EngineStatus.COMPLETED;
    match.isComplete = true;
    match.completedAt = new Date();

    this.activeMatches.delete(matchId);
    this.matchStates.set(matchId, match);

    // Persist final state
    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Gets all active match IDs
   */
  getActiveMatches(): string[] {
    return Array.from(this.activeMatches);
  }

  /**
   * Checks if a player is in an active match
   */
  isPlayerInMatch(playerId: string): boolean {
    for (const matchId of this.activeMatches) {
      const match = this.matchStates.get(matchId);
      if (match && match.players.some((p) => p.id === playerId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the match ID for a player
   */
  getMatchByPlayer(playerId: string): string | undefined {
    for (const matchId of this.activeMatches) {
      const match = this.matchStates.get(matchId);
      if (match && match.players.some((p) => p.id === playerId)) {
        return matchId;
      }
    }
    return undefined;
  }

  /**
   * Gets the count of active matches
   */
  getActiveMatchCount(): number {
    return this.activeMatches.size;
  }
}

// Export singleton instance
export const engineService = new EngineService();
