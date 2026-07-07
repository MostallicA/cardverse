/**
 * Wallet - Validator Layer
 * CV-MOD-008
 *
 * Provides validation functions for wallet-related requests including
 * adding coins, spending coins, and transaction queries.
 */

import { TransactionType, TransactionSource } from './wallet.types';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate add coins request
 */
export function validateAddCoins(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if amount is provided and valid
  if (data.amount === undefined) {
    errors.push('amount is required');
  } else if (typeof data.amount !== 'number') {
    errors.push('amount must be a number');
  } else if (data.amount <= 0) {
    errors.push('amount must be greater than 0');
  } else if (data.amount > 1000000) {
    errors.push('amount must not exceed 1,000,000');
  }

  // Check if source is provided and valid
  if (!data.source) {
    errors.push('source is required');
  } else if (typeof data.source !== 'string') {
    errors.push('source must be a string');
  } else if (!Object.values(TransactionSource).includes(data.source as TransactionSource)) {
    errors.push(`source must be one of: ${Object.values(TransactionSource).join(', ')}`);
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 500) {
      errors.push('description must not exceed 500 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate spend coins request
 */
export function validateSpendCoins(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if amount is provided and valid
  if (data.amount === undefined) {
    errors.push('amount is required');
  } else if (typeof data.amount !== 'number') {
    errors.push('amount must be a number');
  } else if (data.amount <= 0) {
    errors.push('amount must be greater than 0');
  }

  // Check if source is provided and valid
  if (!data.source) {
    errors.push('source is required');
  } else if (typeof data.source !== 'string') {
    errors.push('source must be a string');
  } else if (!Object.values(TransactionSource).includes(data.source as TransactionSource)) {
    errors.push(`source must be one of: ${Object.values(TransactionSource).join(', ')}`);
  }

  // Validate description if provided
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 500) {
      errors.push('description must not exceed 500 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate get transactions query parameters
 */
export function validateGetTransactions(query: Record<string, unknown>): ValidationResult {
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
    } else if (!Object.values(TransactionType).includes(query.type as TransactionType)) {
      errors.push(`type must be one of: ${Object.values(TransactionType).join(', ')}`);
    }
  }

  // Validate source
  if (query.source !== undefined) {
    if (typeof query.source !== 'string') {
      errors.push('source must be a string');
    } else if (!Object.values(TransactionSource).includes(query.source as TransactionSource)) {
      errors.push(`source must be one of: ${Object.values(TransactionSource).join(', ')}`);
    }
  }

  // Validate startDate
  if (query.startDate !== undefined) {
    if (typeof query.startDate !== 'string') {
      errors.push('startDate must be a date string');
    } else {
      const date = new Date(query.startDate);
      if (isNaN(date.getTime())) {
        errors.push('startDate must be a valid date');
      }
    }
  }

  // Validate endDate
  if (query.endDate !== undefined) {
    if (typeof query.endDate !== 'string') {
      errors.push('endDate must be a date string');
    } else {
      const date = new Date(query.endDate);
      if (isNaN(date.getTime())) {
        errors.push('endDate must be a valid date');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
