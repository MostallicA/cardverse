/**
 * Presence - Type Definitions
 * CV-MOD-004
 *
 * Defines types and interfaces for user presence management including
 * online/offline status, device information, and presence statistics.
 */

/* eslint-disable no-unused-vars */
export enum PresenceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}
/* eslint-enable no-unused-vars */

export interface Presence {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: Date;
  currentSessionId?: string;
  deviceInfo?: {
    platform: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface PresenceUpdateRequest {
  status: PresenceStatus;
  deviceInfo?: {
    platform: string;
    userAgent?: string;
  };
}

export interface PresenceResponse {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: Date;
  isOnline: boolean;
}

export interface PresenceBatchResponse {
  presences: PresenceResponse[];
}

export interface PresenceHeartbeatRequest {
  sessionId: string;
  status?: PresenceStatus;
}

export interface PresenceStats {
  totalOnline: number;
  totalAway: number;
  totalBusy: number;
  totalOffline: number;
}
