/**
 * Shop - Validator Layer
 * CV-MOD-009
 *
 * Provides validation functions for shop-related requests including
 * purchasing items, getting shop items, and managing inventory.
 */

import { ShopCategory, Rarity } from './shop.types.js';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate purchase request
 */
export function validatePurchase(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if itemId is provided
  if (!data.itemId) {
    errors.push('itemId is required');
  } else if (typeof data.itemId !== 'string') {
    errors.push('itemId must be a string');
  } else if (data.itemId.length === 0) {
    errors.push('itemId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate get shop items query parameters
 */
export function validateGetShopItems(query: Record<string, unknown>): ValidationResult {
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

  // Validate category
  if (query.category !== undefined) {
    if (typeof query.category !== 'string') {
      errors.push('category must be a string');
    } else if (!Object.values(ShopCategory).includes(query.category as ShopCategory)) {
      errors.push(`category must be one of: ${Object.values(ShopCategory).join(', ')}`);
    }
  }

  // Validate rarity
  if (query.rarity !== undefined) {
    if (typeof query.rarity !== 'string') {
      errors.push('rarity must be a string');
    } else if (!Object.values(Rarity).includes(query.rarity as Rarity)) {
      errors.push(`rarity must be one of: ${Object.values(Rarity).join(', ')}`);
    }
  }

  // Validate search
  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      errors.push('search must be a string');
    } else if (query.search.length > 100) {
      errors.push('search must not exceed 100 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate item ID
 */
export function validateItemId(itemId: string): ValidationResult {
  const errors: string[] = [];

  if (!itemId) {
    errors.push('itemId is required');
  } else if (typeof itemId !== 'string') {
    errors.push('itemId must be a string');
  } else if (itemId.length === 0) {
    errors.push('itemId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate equip/unequip item request
 */
export function validateEquipItem(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if itemId is provided
  if (!data.itemId) {
    errors.push('itemId is required');
  } else if (typeof data.itemId !== 'string') {
    errors.push('itemId must be a string');
  } else if (data.itemId.length === 0) {
    errors.push('itemId must not be empty');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
