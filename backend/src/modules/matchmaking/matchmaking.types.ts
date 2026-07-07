/**
 * Matchmaking - Type Definitions
 * CV-MOD-007
 *
 * Defines types and interfaces for matchmaking system including
 * queue management, player matching, and match creation.
 */

/* eslint-disable no-unused-vars */
export enum MatchmakingStatus {
  QUEUED = 'queued',
  SEARCHING = 'searching',
  MATCH_FOUND = 'match_found',
  MATCH_CREATED = 'match_created',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export enum GameMode {
  RANKED = 'ranked',
  FRIENDLY = 'friendly',
  PRACTICE = 'practice',
}
/* eslint-enable no-unused-vars */

export interface MatchmakingRequest {
  userId: string;
  gameMode: GameMode;
  skillRating: number;
  fairPlayScore: number;
  region: string;
  latency: number;
  queueTime: Date;
  status: MatchmakingStatus;
}

export interface MatchmakingQueueEntry {
  userId: string;
  gameMode: GameMode;
  skillRating: number;
  fairPlayScore: number;
  region: string;
  latency: number;
  joinedAt: Date;
  lastUpdated: Date;
  searchRadius: number;
}

export interface MatchmakingCriteria {
  skillRange: number;
  fairPlayThreshold: number;
  regionMatch: boolean;
  maxLatency: number;
  maxQueueTime: number;
  expansionRate: number;
}

export interface MatchFound {
  matchId: string;
  players: {
    userId: string;
    skillRating: number;
    fairPlayScore: number;
    region: string;
  }[];
  gameMode: GameMode;
  createdAt: Date;
}

export interface JoinQueueRequest {
  gameMode: GameMode;
  region?: string;
}

export interface QueueStatusResponse {
  userId: string;
  status: MatchmakingStatus;
  queuePosition: number;
  estimatedWaitTime: number;
  elapsedTime: number;
  searchRadius: number;
}

export interface MatchmakingStats {
  totalQueued: number;
  totalSearching: number;
  matchesFound: number;
  averageWaitTime: number;
  /* eslint-disable no-unused-vars */
  byGameMode: {
    [key in GameMode]?: {
      queued: number;
      searching: number;
      averageWaitTime: number;
    };
  };
}

export interface CancelQueueRequest {
  userId: string;
}
