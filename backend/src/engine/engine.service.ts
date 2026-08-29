// Engine Layer - Main Service
// Manages the complete lifecycle of a Hokm match

import { cardEngine } from '../game/card/card.engine.js';
import { scoringService } from '../game/scoring/scoring.service.js';
import { ruleExecutor } from '../game/card/rule.executor.js';

import {
  EngineStatus,
  Card,
  Player,
  Team,
  MatchConfig,
  MatchState,
  Trick,
  GameMode,
  Suit,
} from './engine.types.js';
import { gamePersistenceService } from './game-persistence.service.js';

export class EngineService {
  private matchStates: Map<string, MatchState> = new Map();
  private activeMatches: Set<string> = new Set();
  private persistenceEnabled: boolean = true;

  /**
   * Creates a new match with the given configuration
   */
  createMatch(
    matchId: string,
    players: Omit<Player, 'consecutiveMisses'>[],
    config: MatchConfig
  ): MatchState {
    if (players.length !== 4) {
      throw new Error('Hokm requires exactly 4 players');
    }

    const playerObjects: Player[] = players.map((p, index) => ({
      ...p,
      consecutiveMisses: 0,
      // Preserve the isBot flag (bots fill empty seats per RULEBOOK §13).
      isBot: p.isBot === true,
      // GUARANTEE: username is always a non-empty string. Never let a missing
      // username reach the engine state (prevents `undefined.charAt()` crashes
      // and keeps the Player invariant in engine.types.ts).
      username: p.username || `Player ${index + 1}`,
    }));

    const team0Players = playerObjects.filter((p) => p.seatIndex === 0 || p.seatIndex === 2);
    const team1Players = playerObjects.filter((p) => p.seatIndex === 1 || p.seatIndex === 3);

    const teams: Team[] = [
      { id: 0, players: team0Players, setsWon: 0, tricksWon: 0 },
      { id: 1, players: team1Players, setsWon: 0, tricksWon: 0 },
    ];

    const randomIndex = Math.floor(Math.random() * playerObjects.length);
    const hakemId = playerObjects[randomIndex].id;
    const hakemTeamId = teams.find((t) => t.players.some((p) => p.id === hakemId))?.id ?? 0;

    const matchState: MatchState = {
      matchId,
      status: EngineStatus.INITIALIZING,
      config,
      teams,
      players: playerObjects,
      currentSet: 0,
      currentTrickIndex: 0,
      tricks: [],
      currentTrick: {
        cards: [],
        playedBy: [],
        leadSuit: undefined,
      },
      currentPlayerId: undefined,
      hakemId,
      hakemTeamId,
      dealerId: hakemId,
      handCards: {},
      isComplete: false,
      declarationPhase: {
        isComplete: false,
      },
      currentPhaseStartTime: undefined,
    };

    this.matchStates.set(matchId, matchState);
    this.activeMatches.add(matchId);
    scoringService.initializeMatch(matchId);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(matchState);
    }

    return matchState;
  }

  getMatchState(matchId: string): MatchState | undefined {
    return this.matchStates.get(matchId);
  }

  async loadMatchState(matchId: string): Promise<MatchState | undefined> {
    const cached = this.matchStates.get(matchId);
    if (cached) return cached;

    const restored = await gamePersistenceService.loadMatchState(matchId);
    if (restored) {
      this.matchStates.set(matchId, restored);
      this.activeMatches.add(matchId);
    }
    return restored;
  }

  setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  isPersistenceEnabled(): boolean {
    return this.persistenceEnabled;
  }

  startMatch(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);
    if (match.status !== EngineStatus.INITIALIZING) {
      throw new Error(`Match ${matchId} is not in INITIALIZING state`);
    }

    match.status = EngineStatus.LOBBY;
    match.startedAt = new Date();
    match.currentPhaseStartTime = new Date();
    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Deals cards in 5+4+4 pattern per RULEBOOK.md Section 5
   * Phase 1: 5 cards each -> DECLARATION
   * Phase 2: 4+4 cards each -> PLAYING
   */
  dealCards(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    // Only allowed from LOBBY or when restarting a set
    if (match.status !== EngineStatus.LOBBY && match.status !== EngineStatus.SET_RESOLUTION) {
      throw new Error(`Match ${matchId} is not ready for dealing`);
    }

    const deck = cardEngine.createDeck();
    const shuffled = cardEngine.shuffleDeck(deck);
    const dealt = cardEngine.dealCards(shuffled, match.players.length);

    const handCards: Record<string, Card[]> = {};
    match.players.forEach((player, i) => {
      handCards[player.id] = dealt[i] || [];
    });

    match.handCards = handCards;

    // Phase 1 complete -> move to DECLARATION
    // The hakem now has 5 cards and must declare Hokm
    match.status = EngineStatus.DECLARATION;
    match.currentTrickIndex = 0;
    match.tricks = [];
    match.currentTrick = {
      cards: [],
      playedBy: [],
      leadSuit: undefined,
    };
    match.teams.forEach((team) => {
      team.tricksWon = 0;
    });

    // Reset declaration phase
    match.declarationPhase = {
      isComplete: false,
    };
    match.currentPhaseStartTime = new Date();
    match.currentPlayerId = match.hakemId;

    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Hakem declares Hokm mode and optional trump suit
   * Per RULEBOOK.md Section 6
   */
  declareHokm(matchId: string, playerId: string, mode: GameMode, trumpSuit?: Suit): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    // ✅ 1. Only Hakem can declare
    if (match.hakemId !== playerId) {
      throw new Error(`Only the Hakem can declare Hokm. Current Hakem: ${match.hakemId}`);
    }

    // ✅ 2. Match must be in DECLARATION phase
    if (match.status !== EngineStatus.DECLARATION) {
      throw new Error(
        `Match ${matchId} is not in DECLARATION phase. Current status: ${match.status}`
      );
    }

    // ✅ 3. Cannot declare twice
    if (match.declarationPhase?.isComplete) {
      throw new Error(`Hokm has already been declared for this round`);
    }

    // ✅ 4. Validate mode requires trump suit
    if (mode === GameMode.HOKM && !trumpSuit) {
      throw new Error(`HOKM mode requires a trump suit`);
    }

    // ✅ 5. Validate trump suit is valid
    if (trumpSuit && !Object.values(Suit).includes(trumpSuit)) {
      throw new Error(`Invalid trump suit: ${trumpSuit}`);
    }

    // Save declaration
    match.config.mode = mode;
    if (trumpSuit) {
      match.config.trumpSuit = trumpSuit;
    }

    match.declarationPhase = {
      isComplete: true,
      declaredAt: new Date(),
      selectedMode: mode,
      selectedTrumpSuit: trumpSuit,
    };

    // Transition to PLAYING
    match.status = EngineStatus.PLAYING;
    match.currentPhaseStartTime = new Date();

    // The Hakem leads the first trick
    match.currentPlayerId = match.hakemId;

    // Deal remaining 8 cards (4+4) per RULEBOOK.md Section 5
    // Note: This is a simplified approach - in production, we'd want to
    // track that the first 5 cards are already dealt and deal only the remaining 8
    // For now, we rely on dealCards having already dealt all 13 cards
    // The 5+4+4 pattern is handled in cardEngine.dealCards

    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  /**
   * Auto-declare Hokm when timer expires (RULEBOOK.md Section 12)
   * Randomly selects a mode/suit on Hakem's behalf
   */
  autoDeclareHokm(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    if (match.status !== EngineStatus.DECLARATION) {
      throw new Error(`Match ${matchId} is not in DECLARATION phase`);
    }

    if (match.declarationPhase?.isComplete) {
      return match; // Already declared
    }

    // Random selection per RULEBOOK.md Section 12
    const modes = [GameMode.HOKM, GameMode.SARAS, GameMode.NARAS, GameMode.TAK_NARAS];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    let trumpSuit: Suit | undefined = undefined;
    if (randomMode === GameMode.HOKM) {
      const suits = [Suit.KHESHT, Suit.PIK, Suit.DEL, Suit.KHAJ];
      trumpSuit = suits[Math.floor(Math.random() * suits.length)];
    }

    return this.declareHokm(matchId, match.hakemId!, randomMode, trumpSuit);
  }

  playCard(matchId: string, playerId: string, cardId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    // ✅ 1. State validation
    if (match.status !== EngineStatus.PLAYING) {
      throw new Error(`Match ${matchId} is not in PLAYING state`);
    }

    // ✅ 2. Player existence validation
    const player = match.players.find((p) => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);

    // ✅ 3. Player active validation
    if (!player.isActive) throw new Error(`Player ${playerId} is not active`);

    // ✅ 4. Turn validation
    if (match.currentPlayerId !== playerId) {
      throw new Error(`It is not ${playerId}'s turn. Current turn: ${match.currentPlayerId}`);
    }

    // ✅ 5. Seat validation
    const seatIndex = match.players.findIndex((p) => p.id === playerId);
    if (seatIndex !== player.seatIndex) {
      throw new Error(`Player ${playerId} has invalid seat configuration`);
    }

    // ✅ 6. Team validation
    const team = match.teams.find((t) => t.id === player.teamId);
    if (!team) {
      throw new Error(`Player ${playerId} is not in a valid team`);
    }
    if (!team.players.some((p) => p.id === playerId)) {
      throw new Error(`Player ${playerId} is not in team ${player.teamId}`);
    }

    const hand = match.handCards[playerId];
    if (!hand) throw new Error(`Player ${playerId} has no cards`);

    const cardIndex = hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found in player ${playerId}'s hand`);
    }

    // Remove card from hand
    const playedCard = hand.splice(cardIndex, 1)[0];
    match.handCards[playerId] = hand;

    // Add card to current trick
    if (!match.currentTrick) {
      match.currentTrick = { cards: [], playedBy: [], leadSuit: undefined };
    }
    match.currentTrick.cards.push(playedCard);
    match.currentTrick.playedBy.push(playerId);

    // Set lead suit if this is the first card of the trick
    if (match.currentTrick.cards.length === 1) {
      match.currentTrick.leadSuit = playedCard.suit;
    }

    const hakemTeamId = match.hakemTeamId;

    // Check if trick is complete (4 cards played)
    if (match.currentTrick.cards.length === 4) {
      // Determine winner using ruleExecutor
      const winnerInfo = ruleExecutor.getTrickWinner(
        match.currentTrick.cards,
        match.currentTrick.playedBy,
        match.currentTrick.leadSuit!,
        match.config.mode,
        match.config.trumpSuit
      );

      // Find winning team
      const winningPlayerId = winnerInfo.winnerId;
      const winningPlayer = match.players.find((p) => p.id === winningPlayerId);
      if (!winningPlayer) {
        throw new Error(`Winner player ${winningPlayerId} not found`);
      }
      const winningTeam = match.teams.find((t) => t.id === winningPlayer.teamId);
      if (!winningTeam) {
        throw new Error(`Team ${winningPlayer.teamId} not found`);
      }

      // Increment tricksWon for winning team
      winningTeam.tricksWon += 1;

      // Record the completed trick
      const completedTrick: Trick = {
        id: `trick-${match.currentSet}-${match.currentTrickIndex}`,
        roundNumber: match.currentTrickIndex,
        leadSuit: match.currentTrick.leadSuit!,
        cards: [...match.currentTrick.cards],
        playedBy: [...match.currentTrick.playedBy],
        winnerId: winningPlayerId,
        winningTeamId: winningTeam.id,
        isCompleted: true,
      };
      match.tricks.push(completedTrick);
      match.currentTrickIndex += 1;

      // Clear current trick for next round
      match.currentTrick = { cards: [], playedBy: [], leadSuit: undefined };

      // Set next player (who won the trick leads next)
      match.currentPlayerId = winningPlayerId;

      // Check if set is complete (7 tricks won)
      const team0Tricks = match.teams[0].tricksWon;
      const team1Tricks = match.teams[1].tricksWon;

      if (team0Tricks >= 7 || team1Tricks >= 7) {
        match.status = EngineStatus.SET_RESOLUTION;
        match.currentPhaseStartTime = new Date();

        const outcome = ruleExecutor.getRoundOutcome(team0Tricks, team1Tricks, hakemTeamId);
        const hakemId = match.hakemId;
        if (hakemId === undefined) {
          throw new Error(`Match ${matchId} has no hakem`);
        }
        const hakemIndex = match.players.findIndex((p) => p.id === hakemId);
        const nextHakemId = match.players[(hakemIndex + 1) % match.players.length].id;
        const roundResult = {
          ...outcome,
          roundNumber: match.currentSet,
          hakemId,
          nextHakemId,
        };

        scoringService.recordRound(matchId, roundResult);

        const winningTeamSet = match.teams[roundResult.winningTeamId];
        winningTeamSet.setsWon += roundResult.setsAwarded;

        // Check if match is complete (7 sets won)
        if (winningTeamSet.setsWon >= 7) {
          match.status = EngineStatus.MATCH_RESOLUTION;
          match.currentPhaseStartTime = new Date();
          match.status = EngineStatus.COMPLETED;
          match.isComplete = true;
          match.completedAt = new Date();
          this.activeMatches.delete(matchId);
        } else {
          // Start new set
          match.currentSet += 1;
          match.teams.forEach((team) => {
            team.tricksWon = 0;
          });
          match.tricks = [];
          match.currentTrick = {
            cards: [],
            playedBy: [],
            leadSuit: undefined,
          };
          match.status = EngineStatus.LOBBY;
          match.currentPhaseStartTime = new Date();

          // Deal cards for new set
          const deck = cardEngine.createDeck();
          const shuffled = cardEngine.shuffleDeck(deck);
          const dealt = cardEngine.dealCards(shuffled, match.players.length);
          const handCards: Record<string, Card[]> = {};
          match.players.forEach((player, i) => {
            handCards[player.id] = dealt[i] || [];
          });
          match.handCards = handCards;

          match.status = EngineStatus.DECLARATION;
          match.currentPhaseStartTime = new Date();
          match.currentPlayerId = match.hakemId;
          match.declarationPhase = {
            isComplete: false,
          };
        }
      } else {
        // If trick not complete, set next player (counter-clockwise)
        const currentPlayerIndex = match.players.findIndex((p) => p.id === playerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % match.players.length;
        match.currentPlayerId = match.players[nextPlayerIndex].id;
      }
    } else {
      // If trick not complete, set next player (counter-clockwise)
      const currentPlayerIndex = match.players.findIndex((p) => p.id === playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % match.players.length;
      match.currentPlayerId = match.players[nextPlayerIndex].id;
    }

    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  endMatch(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    match.status = EngineStatus.COMPLETED;
    match.isComplete = true;
    match.completedAt = new Date();

    this.activeMatches.delete(matchId);
    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  getActiveMatches(): string[] {
    return Array.from(this.activeMatches);
  }

  isPlayerInMatch(playerId: string): boolean {
    for (const matchId of this.activeMatches) {
      const match = this.matchStates.get(matchId);
      if (match && match.players.some((p) => p.id === playerId)) {
        return true;
      }
    }
    return false;
  }

  getMatchByPlayer(playerId: string): string | undefined {
    for (const matchId of this.activeMatches) {
      const match = this.matchStates.get(matchId);
      if (match && match.players.some((p) => p.id === playerId)) {
        return matchId;
      }
    }
    return undefined;
  }

  getActiveMatchCount(): number {
    return this.activeMatches.size;
  }
}

export const engineService = new EngineService();
