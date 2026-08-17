// Engine Layer - Shared Types

export enum EngineStatus {
  INITIALIZING = 'initializing',
  LOBBY = 'lobby',
  PLAYING = 'playing',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

export enum GameMode {
  HOKM = 'hokm',
  SARAS = 'saras',
  NARAS = 'naras',
  TAK_NARAS = 'tak_naras',
}

export enum Suit {
  KHESHT = 'khesht', // Diamonds
  PIK = 'pik', // Spades
  DEL = 'del', // Hearts
  KHAJ = 'khaj', // Clubs
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'jack',
  QUEEN = 'queen',
  KING = 'king',
  ACE = 'ace',
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g., "ace_khesht"
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  seatIndex: number; // 0-3
  teamId: number; // 0 or 1
  isActive: boolean;
  isBot: boolean;
  consecutiveMisses: number; // For auto-kick tracking
}

export interface Team {
  id: number; // 0 or 1
  players: Player[];
  setsWon: number; // Total sets won in the match
  tricksWon: number; // Tricks won in current set
}

export interface MatchConfig {
  mode: GameMode;
  trumpSuit?: Suit; // Only for HOKM mode
  totalSetsToWin: number; // Default: 7 per RULEBOOK.md
  turnTimeoutMs: number; // ~8000ms per RULEBOOK.md
  declarationTimeoutMs: number; // ~20000ms per RULEBOOK.md
}

export interface Trick {
  id: string;
  roundNumber: number; // 0-12 per set
  leadSuit?: Suit;
  cards: Card[]; // 4 cards played
  playedBy: string[]; // Player IDs
  winnerId?: string;
  winningTeamId?: number;
  isCompleted: boolean;
}

export interface MatchState {
  matchId: string;
  status: EngineStatus;
  config: MatchConfig;
  teams: Team[];
  players: Player[];
  currentSet: number;
  currentTrickIndex: number;
  tricks: Trick[]; // All tricks in current set
  currentTrick: {
    cards: Card[];
    playedBy: string[];
    leadSuit?: Suit;
  }; // Track current trick cards (4 cards before completion)
  currentPlayerId?: string; // Whose turn it is
  hakemId?: string; // Hakem for current round
  hakemTeamId: number;
  dealerId?: string; // Dealer for current round
  handCards: Record<string, Card[]>; // playerId -> cards in hand
  isComplete: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export enum SpecialOutcome {
  NORMAL = 'normal',
  KOOTI = 'kooti',
  HAKEM_KOOTI = 'hakem_kooti',
  BAM = 'bam',
}

export interface RoundResult {
  roundNumber: number;
  winningTeamId: number;
  setsAwarded: number; // 1, 2, or 3 per RULEBOOK.md
  outcome: SpecialOutcome;
  hakemId: string;
  nextHakemId: string;
}

export interface BotConfig {
  difficulty: 'basic' | 'advanced'; // Advanced deferred per RULEBOOK.md Section 13
  grayscaleAvatar: boolean; // Kept for config compatibility; bots are invisible per RULEBOOK.md §13.4
}

export interface DisconnectInfo {
  playerId: string;
  consecutiveMisses: number;
  isAutoKicked: boolean;
  kickedAt?: Date;
  reconnectedAt?: Date;
  replacedByBot: boolean;
}

// Export type aliases to avoid duplicate export names
export type EngineStatusType = EngineStatus;
export type GameModeType = GameMode;
export type SuitType = Suit;
export type RankType = Rank;
export type SpecialOutcomeType = SpecialOutcome;
