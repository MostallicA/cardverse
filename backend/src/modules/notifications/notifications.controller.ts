/**
 * Notifications - Controller Layer
 * CV-MOD-006
 *
 * Handles HTTP requests for system notifications including retrieving,
 * marking as read, managing preferences, and deleting notifications.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils';

import { notificationsService } from './notifications.service';
import {
  validateGetNotifications,
  validateMarkAsRead,
  validateUpdatePreferences,
} from './notifications.validator';
import { NotificationType, NotificationStatus } from './notifications.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class NotificationsController {
  /**
   * Get notifications for current user
   * GET /api/v1/notifications
   */
  getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Parse query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const type = req.query.type as NotificationType | undefined;
      const status = req.query.status as NotificationStatus | undefined;

      // Validate query
      const validation = validateGetNotifications({ limit, offset, type, status });
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const result = await notificationsService.getNotifications(
        userId,
        limit,
        offset,
        type,
        status
      );
      return sendSuccess(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get notifications',
        500
      );
    }
  };

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread
   */
  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const unread = await notificationsService.getUnreadCount(userId);
      return sendSuccess(res, unread, 'Unread count retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get unread count',
        500
      );
    }
  };

  /**
   * Mark notifications as read
   * POST /api/v1/notifications/read
   */
  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateMarkAsRead(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const { notificationIds, all } = req.body;
      const count = await notificationsService.markAsRead(userId, notificationIds, all === true);
      return sendSuccess(res, { markedCount: count }, `${count} notification(s) marked as read`);
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to mark as read', 500);
    }
  };

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:notificationId
   */
  deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const notificationId = getRequiredParamString(req.params.notificationId, 'notificationId');

      await notificationsService.deleteNotification(userId, notificationId);
      return sendSuccess(res, null, 'Notification deleted successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to delete notification',
        500
      );
    }
  };

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications
   */
  deleteAllNotifications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      await notificationsService.deleteAllNotifications(userId);
      return sendSuccess(res, null, 'All notifications deleted successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to delete all notifications',
        500
      );
    }
  };

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const preferences = await notificationsService.getPreferences(userId);
      return sendSuccess(res, preferences, 'Preferences retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get preferences',
        500
      );
    }
  };

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateUpdatePreferences(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const preferences = await notificationsService.updatePreferences(userId, req.body);
      return sendSuccess(res, preferences, 'Preferences updated successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to update preferences',
        500
      );
    }
  };
}

// Export singleton instance
export const notificationsController = new NotificationsController();
