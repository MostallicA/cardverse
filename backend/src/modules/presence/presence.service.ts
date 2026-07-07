/**
 * Presence System - Service Layer
 * CV-MOD-004
 *
 * This service manages user presence status, online/offline state,
 * and real-time availability tracking.
 */

import {
  Presence,
  PresenceStatus,
  PresenceUpdateRequest,
  PresenceResponse,
  PresenceStats,
} from './presence.types';

// In-memory presence store (will be replaced with Redis in production)
const presenceStore = new Map<string, Presence>();

export class PresenceService {
  /**
   * Update user presence status
   */
  async updatePresence(userId: string, request: PresenceUpdateRequest): Promise<PresenceResponse> {
    const existing = presenceStore.get(userId);

    const presence: Presence = {
      userId,
      status: request.status,
      lastSeenAt: new Date(),
      currentSessionId: existing?.currentSessionId,
      deviceInfo: request.deviceInfo
        ? {
            platform: request.deviceInfo.platform,
            userAgent: request.deviceInfo.userAgent,
          }
        : existing?.deviceInfo,
    };

    presenceStore.set(userId, presence);

    return this.toResponse(presence);
  }

  /**
   * Get user presence by userId
   */
  async getPresence(userId: string): Promise<PresenceResponse | null> {
    const presence = presenceStore.get(userId);
    if (!presence) {
      return null;
    }
    return this.toResponse(presence);
  }

  /**
   * Get presence for multiple users
   */
  async getPresenceBatch(userIds: string[]): Promise<PresenceResponse[]> {
    const results: PresenceResponse[] = [];
    for (const userId of userIds) {
      const presence = presenceStore.get(userId);
      if (presence) {
        results.push(this.toResponse(presence));
      }
    }
    return results;
  }

  /**
   * Update heartbeat (refresh lastSeenAt)
   */
  async heartbeat(userId: string, sessionId: string): Promise<void> {
    const existing = presenceStore.get(userId);
    if (existing && existing.currentSessionId === sessionId) {
      existing.lastSeenAt = new Date();
      presenceStore.set(userId, existing);
    }
  }

  /**
   * Set user as online
   */
  async setOnline(
    userId: string,
    sessionId: string,
    deviceInfo?: { platform: string; userAgent?: string }
  ): Promise<PresenceResponse> {
    const presence: Presence = {
      userId,
      status: PresenceStatus.ONLINE,
      lastSeenAt: new Date(),
      currentSessionId: sessionId,
      deviceInfo: deviceInfo
        ? {
            platform: deviceInfo.platform,
            userAgent: deviceInfo.userAgent,
          }
        : undefined,
    };

    presenceStore.set(userId, presence);
    return this.toResponse(presence);
  }

  /**
   * Set user as offline
   */
  async setOffline(userId: string): Promise<void> {
    const existing = presenceStore.get(userId);
    if (existing) {
      existing.status = PresenceStatus.OFFLINE;
      existing.lastSeenAt = new Date();
      presenceStore.set(userId, existing);
    }
  }

  /**
   * Get presence statistics
   */
  async getStats(): Promise<PresenceStats> {
    let totalOnline = 0;
    let totalAway = 0;
    let totalBusy = 0;
    let totalOffline = 0;

    for (const presence of presenceStore.values()) {
      switch (presence.status) {
        case PresenceStatus.ONLINE:
          totalOnline++;
          break;
        case PresenceStatus.AWAY:
          totalAway++;
          break;
        case PresenceStatus.BUSY:
          totalBusy++;
          break;
        case PresenceStatus.OFFLINE:
          totalOffline++;
          break;
      }
    }

    return {
      totalOnline,
      totalAway,
      totalBusy,
      totalOffline,
    };
  }

  /**
   * Convert Presence to PresenceResponse
   */
  private toResponse(presence: Presence): PresenceResponse {
    return {
      userId: presence.userId,
      status: presence.status,
      lastSeenAt: presence.lastSeenAt,
      isOnline: presence.status !== PresenceStatus.OFFLINE,
    };
  }

  /**
   * Check if user is online
   */
  isOnline(userId: string): boolean {
    const presence = presenceStore.get(userId);
    return presence ? presence.status !== PresenceStatus.OFFLINE : false;
  }

  /**
   * Clean up stale sessions (optional - for future cron job)
   */
  cleanupStaleSessions(timeoutMinutes: number = 5): void {
    const now = new Date();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    for (const [userId, presence] of presenceStore) {
      const elapsed = now.getTime() - presence.lastSeenAt.getTime();
      if (elapsed > timeoutMs && presence.status !== PresenceStatus.OFFLINE) {
        presence.status = PresenceStatus.OFFLINE;
        presenceStore.set(userId, presence);
      }
    }
  }
}

// Export singleton instance
export const presenceService = new PresenceService();
