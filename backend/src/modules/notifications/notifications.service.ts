/**
 * Notifications - Service Layer
 * CV-MOD-006
 *
 * Implements business logic for system notifications including creating,
 * retrieving, marking as read, and managing notification preferences.
 */

import {
  Notification,
  NotificationType,
  NotificationStatus,
  CreateNotificationRequest,
  NotificationResponse,
  GetNotificationsResponse,
  NotificationPreferences,
  UpdatePreferencesRequest,
  UnreadCountResponse,
} from './notifications.types.js';

// In-memory stores (will be replaced with PostgreSQL in production)
const notifications = new Map<string, Notification[]>(); // userId -> notifications[]
const preferences = new Map<string, NotificationPreferences>(); // userId -> preferences

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export class NotificationsService {
  /**
   * Create a new notification for a user
   */
  async createNotification(request: CreateNotificationRequest): Promise<NotificationResponse> {
    const notification: Notification = {
      id: generateId(),
      userId: request.userId,
      type: request.type,
      title: request.title,
      content: request.content,
      data: request.data,
      status: NotificationStatus.UNREAD,
      createdAt: new Date(),
    };

    const userNotifications = notifications.get(request.userId) || [];
    userNotifications.unshift(notification); // Add to beginning (newest first)
    notifications.set(request.userId, userNotifications);

    return this.toResponse(notification);
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    type?: NotificationType,
    status?: NotificationStatus
  ): Promise<GetNotificationsResponse> {
    let userNotifications = notifications.get(userId) || [];

    // Filter by type if provided
    if (type) {
      userNotifications = userNotifications.filter((n) => n.type === type);
    }

    // Filter by status if provided
    if (status) {
      userNotifications = userNotifications.filter((n) => n.status === status);
    }

    // Sort by createdAt descending (newest first)
    userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userNotifications.length;
    const paginated = userNotifications.slice(offset, offset + limit);
    const unreadCount = userNotifications.filter(
      (n) => n.status === NotificationStatus.UNREAD
    ).length;
    const hasMore = offset + limit < total;

    return {
      notifications: paginated.map((n) => this.toResponse(n)),
      total,
      unreadCount,
      hasMore,
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const userNotifications = notifications.get(userId) || [];
    const unread = userNotifications.filter((n) => n.status === NotificationStatus.UNREAD);

    /* eslint-disable no-unused-vars */
    const byType: { [key in NotificationType]?: number } = {};
    /* eslint-enable no-unused-vars */
    for (const notification of unread) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
    }

    return {
      total: unread.length,
      byType,
    };
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(
    userId: string,
    notificationIds?: string[],
    all: boolean = false
  ): Promise<number> {
    const userNotifications = notifications.get(userId) || [];
    let markedCount = 0;

    if (all) {
      // Mark all as read
      for (const notification of userNotifications) {
        if (notification.status === NotificationStatus.UNREAD) {
          notification.status = NotificationStatus.READ;
          notification.readAt = new Date();
          markedCount++;
        }
      }
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const idSet = new Set(notificationIds);
      for (const notification of userNotifications) {
        if (idSet.has(notification.id) && notification.status === NotificationStatus.UNREAD) {
          notification.status = NotificationStatus.READ;
          notification.readAt = new Date();
          markedCount++;
        }
      }
    }

    notifications.set(userId, userNotifications);
    return markedCount;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const userNotifications = notifications.get(userId) || [];
    const index = userNotifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      notifications.set(userId, userNotifications);
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    notifications.set(userId, []);
  }

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const userPreferences = preferences.get(userId);
    if (userPreferences) {
      return userPreferences;
    }

    // Default preferences (all enabled)
    const defaultPreferences: NotificationPreferences = {
      userId,
      enabled: true,
      types: {
        [NotificationType.FRIEND_REQUEST]: true,
        [NotificationType.FRIEND_ACCEPTED]: true,
        [NotificationType.MATCH_INVITATION]: true,
        [NotificationType.DAILY_REWARD]: true,
        [NotificationType.ACHIEVEMENT_UNLOCKED]: true,
        [NotificationType.MISSION_COMPLETED]: true,
        [NotificationType.SEASON_REWARD]: true,
        [NotificationType.SYSTEM_ANNOUNCEMENT]: true,
      },
      updatedAt: new Date(),
    };

    preferences.set(userId, defaultPreferences);
    return defaultPreferences;
  }

  /**
   * Update notification preferences for a user
   */
  async updatePreferences(
    userId: string,
    request: UpdatePreferencesRequest
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);

    if (request.enabled !== undefined) {
      current.enabled = request.enabled;
    }

    if (request.types) {
      current.types = {
        ...current.types,
        ...request.types,
      };
    }

    current.updatedAt = new Date();
    preferences.set(userId, current);

    return current;
  }

  /**
   * Check if a user should receive a notification type
   */
  async shouldSendNotification(userId: string, type: NotificationType): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.enabled) {
      return false;
    }
    // This line was causing the error - using type directly without iterating
    return prefs.types[type] !== false;
  }

  /**
   * Convert Notification to NotificationResponse
   */
  private toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      status: notification.status,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();
