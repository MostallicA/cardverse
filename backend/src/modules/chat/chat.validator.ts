/**
 * Chat - Validator Layer
 * CV-MOD-005
 *
 * Provides validation functions for chat-related requests including
 * sending messages, retrieving chat history, and marking messages as read.
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate send message request
 */
export function validateSendMessage(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if receiverId is provided
  if (!data.receiverId) {
    errors.push('receiverId is required');
  } else if (typeof data.receiverId !== 'string') {
    errors.push('receiverId must be a string');
  } else if (data.receiverId.length === 0) {
    errors.push('receiverId must not be empty');
  }

  // Check if content is provided
  if (!data.content) {
    errors.push('content is required');
  } else if (typeof data.content !== 'string') {
    errors.push('content must be a string');
  } else if (data.content.trim().length === 0) {
    errors.push('content must not be empty');
  } else if (data.content.length > 5000) {
    errors.push('content must not exceed 5000 characters');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate get messages request
 */
export function validateGetMessages(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if limit is provided and valid
  if (data.limit !== undefined) {
    if (typeof data.limit !== 'number') {
      errors.push('limit must be a number');
    } else if (data.limit < 1) {
      errors.push('limit must be at least 1');
    } else if (data.limit > 100) {
      errors.push('limit must not exceed 100');
    }
  }

  // Check if before date is valid
  if (data.before !== undefined) {
    if (typeof data.before !== 'string') {
      errors.push('before must be a date string');
    } else {
      const date = new Date(data.before);
      if (isNaN(date.getTime())) {
        errors.push('before must be a valid date');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate friend ID
 */
export function validateFriendId(friendId: string): ValidationResult {
  const errors: string[] = [];

  if (!friendId) {
    errors.push('friendId is required');
  } else if (typeof friendId !== 'string') {
    errors.push('friendId must be a string');
  } else if (friendId.length === 0) {
    errors.push('friendId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate message ID
 */
export function validateMessageId(messageId: string): ValidationResult {
  const errors: string[] = [];

  if (!messageId) {
    errors.push('messageId is required');
  } else if (typeof messageId !== 'string') {
    errors.push('messageId must be a string');
  } else if (messageId.length === 0) {
    errors.push('messageId must not be empty');
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

  // Check if friendId is provided
  if (!data.friendId) {
    errors.push('friendId is required');
  } else if (typeof data.friendId !== 'string') {
    errors.push('friendId must be a string');
  } else if (data.friendId.length === 0) {
    errors.push('friendId must not be empty');
  }

  // Validate messageIds if provided
  if (data.messageIds !== undefined) {
    if (!Array.isArray(data.messageIds)) {
      errors.push('messageIds must be an array');
    } else {
      for (let i = 0; i < data.messageIds.length; i++) {
        if (typeof data.messageIds[i] !== 'string') {
          errors.push(`messageIds[${i}] must be a string`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
