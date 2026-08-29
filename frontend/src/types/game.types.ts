/**
 * CardVerse Frontend - Game Types
 *
 * Shared types for game client components
 * Sync with backend/src/engine/engine.types.ts (S12 - Game Integrity Audit)
 */

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// Card types
// ============================================================

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
  id: string;
  suit: Suit;
  rank: Rank;
}

// ============================================================
// Player & Team types
// ============================================================

export interface Player {
  id: string;
  userId: string;
  username: string;
  seatIndex: number; // 0-3
  teamId: number; // 0 or 1
  isActive: boolean;
  isBot: boolean;
  consecutiveMisses?: number; // For auto-kick tracking
  cardCount?: number;
}

export interface Team {
  id: number;
  players: Player[];
  setsWon: number;
  tricksWon: number;
}

// ============================================================
// Game modes (synced with backend)
// ============================================================

export enum GameMode {
  HOKM = 'hokm',
  SARAS = 'saras',
  NARAS = 'naras',
  TAK_NARAS = 'tak_naras',
}

// ============================================================
// Engine Status - Full 9 states (S12 - Game Integrity Audit)
// Per RULEBOOK.md Section 9 - Scoring Hierarchy
// ============================================================

export enum EngineStatus {
  INITIALIZING = 'initializing',
  LOBBY = 'lobby',
  DEALING = 'dealing', // 5+4+4 card dealing
  DECLARATION = 'declaration', // Hakem declares Hokm
  PLAYING = 'playing', // Main gameplay
  TRICK_RESOLUTION = 'trick_resolution', // Trick winner determined
  SET_RESOLUTION = 'set_resolution', // Set winner determined
  MATCH_RESOLUTION = 'match_resolution', // Match winner determined
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

// ============================================================
// Match State (synced with backend engine.types.ts)
// ============================================================

export interface MatchState {
  matchId: string;
  status: EngineStatus; // Now using full EngineStatus enum
  config: {
    mode: GameMode;
    trumpSuit?: Suit;
    totalSetsToWin: number;
    turnTimeoutMs: number;
    declarationTimeoutMs: number;
  };
  teams: Team[];
  players: Player[];
  currentSet: number;
  currentTrickIndex: number;
  tricks: any[]; // Full Trick array
  currentTrick: {
    cards: Card[];
    playedBy: string[];
    leadSuit?: Suit;
  };
  currentPlayerId?: string;
  hakemId?: string;
  hakemTeamId: number;
  dealerId?: string;
  handCards: Record<string, Card[]>;
  isComplete: boolean;
  startedAt?: Date;
  completedAt?: Date;
  // S12 - Declaration Phase tracking
  declarationPhase?: {
    isComplete: boolean;
    declaredAt?: Date;
    selectedMode?: GameMode;
    selectedTrumpSuit?: Suit;
  };
  // S12 - Timer management
  currentPhaseStartTime?: Date;
}

// ============================================================
// Socket Events - Server to Client
// ============================================================

export interface ServerToClientEvents {
  // Match events
  match_created: (data: { matchId: string; players: any[] }) => void;
  match_started: (data: { matchId: string; config: any }) => void;
  match_updated: (data: { matchId: string; state: MatchState }) => void;
  match_completed: (data: { matchId: string; result: any }) => void;

  // Turn events
  turn_started: (data: { playerId: string; timeoutMs: number }) => void;
  turn_timeout: (data: { playerId: string; consecutiveMisses: number }) => void;
  card_played: (data: { playerId: string; cardId: string; trick: any }) => void;

  // Declaration events (S12)
  declaration_started: (data: { hakemId: string; timeoutMs: number }) => void;
  declaration_completed: (data: { mode: string; trumpSuit?: string }) => void;

  // Disconnect events
  player_auto_kicked: (data: { playerId: string; message: string }) => void;
  player_reconnected: (data: { playerId: string }) => void;

  // Chat events
  chat_message: (data: { from: string; message: string; timestamp: Date }) => void;

  // Error events
  error: (data: { code: string; message: string }) => void;
}

// ============================================================
// Socket Events - Client to Server
// ============================================================

export interface ClientToServerEvents {
  // Match events
  create_match: (data: { players: any[]; config: any }) => void;
  start_match: (data: { matchId: string }) => void;
  join_match: (data: { matchId: string; playerId: string }) => void;
  leave_match: (data: { matchId: string; playerId: string }) => void;

  // Turn events
  play_card: (data: { matchId: string; playerId: string; cardId: string }) => void;

  // Declaration events (S12)
  declare_hokm: (data: { matchId: string; playerId: string; mode: GameMode; suit?: Suit }) => void;

  // Ready events
  set_ready: (data: { matchId: string; playerId: string; isReady: boolean }) => void;

  // Chat events
  send_chat: (data: { matchId: string; playerId: string; message: string }) => void;

  // Disconnect events
  reconnect: (data: { matchId: string; playerId: string }) => void;
}

// ============================================================
// Component Props
// ============================================================

export interface CardProps {
  card: Card;
  onClick?: (card: Card) => void;
  isPlayable?: boolean;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface PlayerSeatProps {
  player: Player | null;
  seatIndex: number;
  isCurrentTurn?: boolean;
  isHakem?: boolean;
  cardCount?: number;
  isReady?: boolean;
  onReadyToggle?: (isReady: boolean) => void;
}

export interface HandProps {
  cards: Card[];
  playerId: string;
  isCurrentPlayer: boolean;
  onCardClick: (card: Card) => void;
}
