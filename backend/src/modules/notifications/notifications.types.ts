/**
 * Notifications - Type Definitions
 * CV-MOD-006
 *
 * Defines types and interfaces for system notifications including
 * notification types, delivery status, and user preferences.
 */

/* eslint-disable no-unused-vars */
export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPTED = 'friend_accepted',
  MATCH_INVITATION = 'match_invitation',
  DAILY_REWARD = 'daily_reward',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  MISSION_COMPLETED = 'mission_completed',
  SEASON_REWARD = 'season_reward',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}
/* eslint-enable no-unused-vars */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
}

export interface GetNotificationsResponse {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  /* eslint-disable no-unused-vars */
  types: {
    [key in NotificationType]?: boolean;
  };
  /* eslint-enable no-unused-vars */
  updatedAt: Date;
}

export interface UpdatePreferencesRequest {
  enabled?: boolean;
  /* eslint-disable no-unused-vars */
  types?: {
    [key in NotificationType]?: boolean;
  };
  /* eslint-enable no-unused-vars */
}

export interface MarkAsReadRequest {
  notificationIds?: string[];
  all?: boolean;
}

export interface UnreadCountResponse {
  total: number;
  /* eslint-disable no-unused-vars */
  byType: {
    [key in NotificationType]?: number;
  };
  /* eslint-enable no-unused-vars */
}
