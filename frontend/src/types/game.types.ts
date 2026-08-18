/**
 * CardVerse Frontend - Game Types
 * 
 * Shared types for game client components
 */

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Card types
export enum Suit {
  KHESHT = 'khesht',  // Diamonds
  PIK = 'pik',        // Spades
  DEL = 'del',        // Hearts
  KHAJ = 'khaj',      // Clubs
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

// Player types
export interface Player {
  id: string;
  userId: string;
  username: string;
  seatIndex: number; // 0-3
  teamId: number; // 0 or 1
  isActive: boolean;
  isBot: boolean;
  cardCount?: number;
}

// Team types
export interface Team {
  id: number;
  players: Player[];
  setsWon: number;
  tricksWon: number;
}

// Game modes
export enum GameMode {
  HOKM = 'hokm',
  SARAS = 'saras',
  NARAS = 'naras',
  TAK_NARAS = 'tak_naras',
}

// Match state
export interface MatchState {
  matchId: string;
  status: 'initializing' | 'lobby' | 'playing' | 'completed' | 'terminated';
  config: {
    mode: GameMode;
    trumpSuit?: Suit;
    totalSetsToWin: number;
  };
  teams: Team[];
  players: Player[];
  currentSet: number;
  currentTrickIndex: number;
  currentPlayerId?: string;
  hakemId?: string;
  hakemTeamId: number;
  handCards: Record<string, Card[]>; // playerId -> cards in hand
  currentTrick: {
    cards: Card[];
    playedBy: string[];
    leadSuit?: Suit;
  };
  tricks: any[];
  isComplete: boolean;
}

// Socket events
export interface ServerToClientEvents {
  match_created: (data: { matchId: string; players: any[] }) => void;
  match_started: (data: { matchId: string; config: any }) => void;
  match_updated: (data: { matchId: string; state: MatchState }) => void;
  match_completed: (data: { matchId: string; result: any }) => void;
  turn_started: (data: { playerId: string; timeoutMs: number }) => void;
  turn_timeout: (data: { playerId: string; consecutiveMisses: number }) => void;
  card_played: (data: { playerId: string; cardId: string; trick: any }) => void;
  player_auto_kicked: (data: { playerId: string; message: string }) => void;
  player_reconnected: (data: { playerId: string }) => void;
  chat_message: (data: { from: string; message: string; timestamp: Date }) => void;
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  create_match: (data: { players: any[]; config: any }) => void;
  start_match: (data: { matchId: string }) => void;
  join_match: (data: { matchId: string; playerId: string }) => void;
  leave_match: (data: { matchId: string; playerId: string }) => void;
  play_card: (data: { matchId: string; playerId: string; cardId: string }) => void;
  declare_hokm: (data: { matchId: string; playerId: string; mode: string; suit?: string }) => void;
  set_ready: (data: { matchId: string; playerId: string; isReady: boolean }) => void;
  send_chat: (data: { matchId: string; playerId: string; message: string }) => void;
  reconnect: (data: { matchId: string; playerId: string }) => void;
}

// Component props
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