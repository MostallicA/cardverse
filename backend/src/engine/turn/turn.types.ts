// Turn Manager - Types

export enum TurnPhase {
  DECLARATION = 'declaration', // Hakem declaring Hokm
  PLAYING = 'playing', // Playing a card
}

export interface TurnInfo {
  playerId: string;
  phase: TurnPhase;
  startedAt: Date;
  timeoutMs: number;
  isCompleted: boolean;
  cardPlayed?: string; // Card ID if played
}

export interface TurnTimeoutEvent {
  playerId: string;
  matchId: string;
  phase: TurnPhase;
  consecutiveMisses: number;
}

export interface TurnManagerConfig {
  declarationTimeoutMs: number; // ~20000ms per RULEBOOK.md
  turnTimeoutMs: number; // ~8000ms per RULEBOOK.md
  maxConsecutiveMisses: number; // 3 per RULEBOOK.md
}

// Export enums as types
// TurnPhase is already exported above as a named export