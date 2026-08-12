/**
 * Matchmaking - Validator Layer
 * CV-MOD-007
 *
 * Provides validation functions for matchmaking-related requests including
 * joining queue, leaving queue, and getting queue status.
 */

import { GameMode } from './matchmaking.types.js';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate join queue request
 */
export function validateJoinQueue(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if gameMode is provided
  if (!data.gameMode) {
    errors.push('gameMode is required');
  } else if (typeof data.gameMode !== 'string') {
    errors.push('gameMode must be a string');
  } else if (!Object.values(GameMode).includes(data.gameMode as GameMode)) {
    errors.push(`gameMode must be one of: ${Object.values(GameMode).join(', ')}`);
  }

  // Validate region if provided
  if (data.region !== undefined) {
    if (typeof data.region !== 'string') {
      errors.push('region must be a string');
    } else if (data.region.length === 0) {
      errors.push('region must not be empty');
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

/**
 * Validate match ID
 */
export function validateMatchId(matchId: string): ValidationResult {
  const errors: string[] = [];

  if (!matchId) {
    errors.push('matchId is required');
  } else if (typeof matchId !== 'string') {
    errors.push('matchId must be a string');
  } else if (matchId.length === 0) {
    errors.push('matchId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
