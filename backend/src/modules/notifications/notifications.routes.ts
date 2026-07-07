/**
 * Notifications - Routes Layer
 * CV-MOD-006
 *
 * Defines API routes for system notifications including retrieving,
 * marking as read, managing preferences, and deleting notifications.
 */

import { Router } from 'express';

import { notificationsController } from './notifications.controller';

const router = Router();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get notifications for current user
 * @access  Private
 */
router.get('/', notificationsController.getNotifications);

/**
 * @route   GET /api/v1/notifications/unread
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread', notificationsController.getUnreadCount);

/**
 * @route   POST /api/v1/notifications/read
 * @desc    Mark notifications as read
 * @access  Private
 */
router.post('/read', notificationsController.markAsRead);

/**
 * @route   DELETE /api/v1/notifications/:notificationId
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:notificationId', notificationsController.deleteNotification);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
router.delete('/', notificationsController.deleteAllNotifications);

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', notificationsController.getPreferences);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', notificationsController.updatePreferences);

export default router;
