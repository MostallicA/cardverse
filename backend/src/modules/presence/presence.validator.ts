/**
 * Presence - Validator Layer
 * CV-MOD-004
 *
 * Provides validation functions for presence-related requests including
 * status updates, heartbeat, and batch queries.
 */

import { PresenceStatus } from './presence.types.js';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate presence update request
 */
export function validatePresenceUpdate(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if status is provided
  if (!data.status) {
    errors.push('status is required');
  } else if (!Object.values(PresenceStatus).includes(data.status as PresenceStatus)) {
    errors.push(`status must be one of: ${Object.values(PresenceStatus).join(', ')}`);
  }

  // Validate device info if provided
  if (data.deviceInfo) {
    if (typeof data.deviceInfo !== 'object') {
      errors.push('deviceInfo must be an object');
    } else {
      const deviceInfo = data.deviceInfo as Record<string, unknown>;
      if (!deviceInfo.platform) {
        errors.push('deviceInfo.platform is required');
      }
      if (typeof deviceInfo.platform !== 'string') {
        errors.push('deviceInfo.platform must be a string');
      }
      if (deviceInfo.userAgent && typeof deviceInfo.userAgent !== 'string') {
        errors.push('deviceInfo.userAgent must be a string');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate heartbeat request
 */
export function validateHeartbeat(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if sessionId is provided
  if (!data.sessionId) {
    errors.push('sessionId is required');
  } else if (typeof data.sessionId !== 'string') {
    errors.push('sessionId must be a string');
  }

  // Validate status if provided
  if (data.status && !Object.values(PresenceStatus).includes(data.status as PresenceStatus)) {
    errors.push(`status must be one of: ${Object.values(PresenceStatus).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate batch presence query
 */
export function validateBatchQuery(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if userIds is provided
  if (!data.userIds) {
    errors.push('userIds is required');
  } else if (!Array.isArray(data.userIds)) {
    errors.push('userIds must be an array');
  } else if (data.userIds.length === 0) {
    errors.push('userIds must not be empty');
  } else if (data.userIds.length > 100) {
    errors.push('userIds must not exceed 100 items');
  } else {
    for (let i = 0; i < data.userIds.length; i++) {
      if (typeof data.userIds[i] !== 'string') {
        errors.push(`userIds[${i}] must be a string`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate user ID
 */
export function validateUserId(userId: string): ValidationResult {
  const errors: string[] = [];

  if (!userId) {
    errors.push('userId is required');
  } else if (typeof userId !== 'string') {
    errors.push('userId must be a string');
  } else if (userId.length === 0) {
    errors.push('userId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
