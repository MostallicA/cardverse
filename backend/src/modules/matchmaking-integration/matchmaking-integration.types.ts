/**
 * Matchmaking Integration - Type Definitions
 *
 * Defines types for connecting Matchmaking Foundation with Engine Layer
 */

import { GameMode as MatchmakingGameMode } from '../matchmaking/matchmaking.types';

export interface MatchmakingMatchRequest {
  queueEntryId: string;
  players: {
    userId: string;
    username: string;
    skillRating: number;
    fairPlayScore: number;
    region: string;
  }[];
  gameMode: MatchmakingGameMode;
}

export interface MatchCreationResult {
  matchId: string;
  success: boolean;
  error?: string;
  matchState?: any;
}

export interface MatchmakingIntegrationConfig {
  defaultTotalSetsToWin: number; // 7 per RULEBOOK.md
  defaultTurnTimeoutMs: number; // 8000ms
  defaultDeclarationTimeoutMs: number; // 20000ms
  botReplacementEnabled: boolean;
  coinPenaltyAmount: number; // TBD per RULEBOOK.md Section 13
}

export interface MatchPlayerAssignment {
  userId: string;
  username: string;
  seatIndex: number;
  teamId: number;
  isBot: boolean;
}

export interface MatchStatisticsRecord {
  matchId: string;
  players: {
    userId: string;
    username: string;
    teamId: number;
    tricksWon: number;
    setsWon: number;
    isWinner: boolean;
  }[];
  duration: number; // in milliseconds
  completedAt: Date;
  gameMode: MatchmakingGameMode;
}
