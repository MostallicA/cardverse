/**
 * Notifications - Controller Layer
 * CV-MOD-006
 *
 * Handles HTTP requests for system notifications including retrieving,
 * marking as read, managing preferences, and deleting notifications.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { notificationsService } from './notifications.service';
import {
  validateGetNotifications,
  validateMarkAsRead,
  validateUpdatePreferences,
  validateNotificationId,
} from './notifications.validator';
import { NotificationType, NotificationStatus } from './notifications.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class NotificationsController {
  /**
   * Get notifications for current user
   * GET /api/v1/notifications
   */
  getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const type = req.query.type as NotificationType | undefined;
    const status = req.query.status as NotificationStatus | undefined;

    // Validate query
    const validation = validateGetNotifications({ limit, offset, type, status });
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await notificationsService.getNotifications(userId, limit, offset, type, status);

    return successResponse(res, result, 'Notifications retrieved successfully');
  });

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread
   */
  getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const unread = await notificationsService.getUnreadCount(userId);
    return successResponse(res, unread, 'Unread count retrieved successfully');
  });

  /**
   * Mark notifications as read
   * POST /api/v1/notifications/read
   */
  markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateMarkAsRead(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const { notificationIds, all } = req.body;
    const count = await notificationsService.markAsRead(userId, notificationIds, all === true);

    return successResponse(res, { markedCount: count }, `${count} notification(s) marked as read`);
  });

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:notificationId
   */
  deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { notificationId } = req.params;

    // Validate notificationId
    const validation = validateNotificationId(notificationId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await notificationsService.deleteNotification(userId, notificationId);
    return successResponse(res, null, 'Notification deleted successfully');
  });

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications
   */
  deleteAllNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    await notificationsService.deleteAllNotifications(userId);
    return successResponse(res, null, 'All notifications deleted successfully');
  });

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const preferences = await notificationsService.getPreferences(userId);
    return successResponse(res, preferences, 'Preferences retrieved successfully');
  });

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  updatePreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateUpdatePreferences(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const preferences = await notificationsService.updatePreferences(userId, req.body);
    return successResponse(res, preferences, 'Preferences updated successfully');
  });
}

// Export singleton instance
export const notificationsController = new NotificationsController();
