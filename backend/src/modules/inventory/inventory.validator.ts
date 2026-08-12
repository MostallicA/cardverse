/**
 * Inventory - Validator Layer
 * CV-MOD-010
 *
 * Provides validation functions for inventory-related requests including
 * viewing items, using items, and transferring items.
 */

import { ShopCategory, Rarity } from '../shop/shop.types.js';

import { ItemType, InventoryItemStatus } from './inventory.types.js';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate get inventory query parameters
 */
export function validateGetInventory(query: Record<string, unknown>): ValidationResult {
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

  // Validate item type
  if (query.itemType !== undefined) {
    if (typeof query.itemType !== 'string') {
      errors.push('itemType must be a string');
    } else if (!Object.values(ItemType).includes(query.itemType as ItemType)) {
      errors.push(`itemType must be one of: ${Object.values(ItemType).join(', ')}`);
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

  // Validate status
  if (query.status !== undefined) {
    if (typeof query.status !== 'string') {
      errors.push('status must be a string');
    } else if (!Object.values(InventoryItemStatus).includes(query.status as InventoryItemStatus)) {
      errors.push(`status must be one of: ${Object.values(InventoryItemStatus).join(', ')}`);
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
 * Validate use item request
 */
export function validateUseItem(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if itemId is provided
  if (!data.itemId) {
    errors.push('itemId is required');
  } else if (typeof data.itemId !== 'string') {
    errors.push('itemId must be a string');
  } else if (data.itemId.length === 0) {
    errors.push('itemId must not be empty');
  }

  // Validate quantity if provided
  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number') {
      errors.push('quantity must be a number');
    } else if (data.quantity < 1) {
      errors.push('quantity must be at least 1');
    } else if (data.quantity > 999) {
      errors.push('quantity must not exceed 999');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate transfer item request
 */
export function validateTransferItem(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Check if targetUserId is provided
  if (!data.targetUserId) {
    errors.push('targetUserId is required');
  } else if (typeof data.targetUserId !== 'string') {
    errors.push('targetUserId must be a string');
  } else if (data.targetUserId.length === 0) {
    errors.push('targetUserId must not be empty');
  }

  // Check if itemId is provided
  if (!data.itemId) {
    errors.push('itemId is required');
  } else if (typeof data.itemId !== 'string') {
    errors.push('itemId must be a string');
  } else if (data.itemId.length === 0) {
    errors.push('itemId must not be empty');
  }

  // Validate quantity if provided
  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number') {
      errors.push('quantity must be a number');
    } else if (data.quantity < 1) {
      errors.push('quantity must be at least 1');
    } else if (data.quantity > 999) {
      errors.push('quantity must not exceed 999');
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
