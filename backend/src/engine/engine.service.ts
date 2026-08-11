// Engine Layer - Main Service
// Manages the complete lifecycle of a Hokm match

import { cardEngine } from '../game/card/card.engine';
import { scoringService } from '../game/scoring/scoring.service';
import { ruleExecutor } from '../game/card/rule.executor';

import { EngineStatus, Card, Player, Team, MatchConfig, MatchState } from './engine.types';
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
    if (players.length !== 4) {
      throw new Error('Hokm requires exactly 4 players');
    }

    const playerObjects: Player[] = players.map((p) => ({
      ...p,
      consecutiveMisses: 0,
      isBot: false,
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
      hakemId,
      hakemTeamId,
      dealerId: hakemId,
      handCards: {},
      isComplete: false,
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
    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  dealCards(matchId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);
    if (match.status !== EngineStatus.LOBBY && match.status !== EngineStatus.PLAYING) {
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
    match.status = EngineStatus.PLAYING;
    match.currentTrickIndex = 0;
    match.tricks = [];
    match.teams.forEach((team) => {
      team.tricksWon = 0;
    });

    this.matchStates.set(matchId, match);

    if (this.persistenceEnabled) {
      void gamePersistenceService.saveMatchState(match);
    }

    return match;
  }

  playCard(matchId: string, playerId: string, cardId: string): MatchState {
    const match = this.getMatchState(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);
    if (match.status !== EngineStatus.PLAYING) {
      throw new Error(`Match ${matchId} is not in PLAYING state`);
    }

    const player = match.players.find((p) => p.id === playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);
    if (!player.isActive) throw new Error(`Player ${playerId} is not active`);

    const hand = match.handCards[playerId];
    if (!hand) throw new Error(`Player ${playerId} has no cards`);

    const cardIndex = hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card ${cardId} not found in player ${playerId}'s hand`);
    }

    hand.splice(cardIndex, 1);
    match.handCards[playerId] = hand;

    // ✅ استفاده از `hakemTeamId` ذخیره‌شده در matchState
    const hakemTeamId = match.hakemTeamId;

    // 🔧 این بخش باید با منطق واقعی `getTrickWinner` جایگزین شود
    const playerTeam = match.teams.find((t) => t.players.some((p) => p.id === playerId));
    if (playerTeam) {
      playerTeam.tricksWon += 1;
    }

    const team0Tricks = match.teams[0].tricksWon;
    const team1Tricks = match.teams[1].tricksWon;

    if (team0Tricks >= 7 || team1Tricks >= 7) {
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

      const winningTeam = match.teams[roundResult.winningTeamId];
      winningTeam.setsWon += roundResult.setsAwarded;

      if (winningTeam.setsWon >= 7) {
        match.status = EngineStatus.COMPLETED;
        match.isComplete = true;
        match.completedAt = new Date();
        this.activeMatches.delete(matchId);
      } else {
        match.currentSet += 1;
        match.teams.forEach((team) => {
          team.tricksWon = 0;
        });
        match.tricks = [];

        const deck = cardEngine.createDeck();
        const shuffled = cardEngine.shuffleDeck(deck);
        const dealt = cardEngine.dealCards(shuffled, match.players.length);
        const handCards: Record<string, Card[]> = {};
        match.players.forEach((player, i) => {
          handCards[player.id] = dealt[i] || [];
        });
        match.handCards = handCards;
      }
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
