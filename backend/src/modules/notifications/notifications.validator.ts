/**
 * Notifications - Validator Layer
 * CV-MOD-006
 *
 * Provides validation functions for notification-related requests including
 * retrieving notifications, marking as read, and updating preferences.
 */

import { NotificationType, NotificationStatus } from './notifications.types';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate get notifications query parameters
 */
export function validateGetNotifications(query: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Validate limit
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'number') {
      errors.push('limit must be a number');
    } else if (query.limit < 1) {
      errors.push('limit must be at least 1');
    } else if (query.limit > 100) {
      errors.push('limit must not exceed 100');
    }
  }

  // Validate offset
  if (query.offset !== undefined) {
    if (typeof query.offset !== 'number') {
      errors.push('offset must be a number');
    } else if (query.offset < 0) {
      errors.push('offset must be at least 0');
    }
  }

  // Validate type
  if (query.type !== undefined) {
    if (typeof query.type !== 'string') {
      errors.push('type must be a string');
    } else if (!Object.values(NotificationType).includes(query.type as NotificationType)) {
      errors.push(`type must be one of: ${Object.values(NotificationType).join(', ')}`);
    }
  }

  // Validate status
  if (query.status !== undefined) {
    if (typeof query.status !== 'string') {
      errors.push('status must be a string');
    } else if (!Object.values(NotificationStatus).includes(query.status as NotificationStatus)) {
      errors.push(`status must be one of: ${Object.values(NotificationStatus).join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate mark as read request
 */
export function validateMarkAsRead(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if notificationIds is provided and valid
  if (data.notificationIds !== undefined) {
    if (!Array.isArray(data.notificationIds)) {
      errors.push('notificationIds must be an array');
    } else {
      for (let i = 0; i < data.notificationIds.length; i++) {
        if (typeof data.notificationIds[i] !== 'string') {
          errors.push(`notificationIds[${i}] must be a string`);
        }
      }
    }
  }

  // Check if all flag is provided
  if (data.all !== undefined) {
    if (typeof data.all !== 'boolean') {
      errors.push('all must be a boolean');
    }
  }

  // At least one of notificationIds or all must be provided
  if (
    (!data.notificationIds ||
      (Array.isArray(data.notificationIds) && data.notificationIds.length === 0)) &&
    data.all !== true
  ) {
    errors.push('Either notificationIds or all=true must be provided');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate update preferences request
 */
export function validateUpdatePreferences(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Validate enabled if provided
  if (data.enabled !== undefined) {
    if (typeof data.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }
  }

  // Validate types if provided
  if (data.types !== undefined) {
    if (typeof data.types !== 'object' || Array.isArray(data.types)) {
      errors.push('types must be an object');
    } else {
      const types = data.types as Record<string, unknown>;
      for (const [key, value] of Object.entries(types)) {
        if (!Object.values(NotificationType).includes(key as NotificationType)) {
          errors.push(`type "${key}" is not a valid notification type`);
        }
        if (typeof value !== 'boolean') {
          errors.push(`type "${key}" must be a boolean`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate notification ID
 */
export function validateNotificationId(notificationId: string): ValidationResult {
  const errors: string[] = [];

  if (!notificationId) {
    errors.push('notificationId is required');
  } else if (typeof notificationId !== 'string') {
    errors.push('notificationId must be a string');
  } else if (notificationId.length === 0) {
    errors.push('notificationId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
