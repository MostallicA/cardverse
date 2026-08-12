/**
 * Inventory - Type Definitions
 * CV-MOD-010
 *
 * Defines types and interfaces for inventory system including
 * inventory items, categories, and item management.
 */

import { ShopCategory, Rarity } from '../shop/shop.types.js';

/* eslint-disable no-unused-vars */
export enum InventoryItemStatus {
  OWNED = 'owned',
  EQUIPPED = 'equipped',
  CONSUMED = 'consumed',
  EXPIRED = 'expired',
}

export enum ItemType {
  COSMETIC = 'cosmetic',
  CONSUMABLE = 'consumable',
  COLLECTIBLE = 'collectible',
}
/* eslint-enable no-unused-vars */

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  category: ShopCategory;
  rarity: Rarity;
  description: string;
  imageUrl?: string;
  status: InventoryItemStatus;
  quantity: number;
  acquiredAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetInventoryRequest {
  category?: ShopCategory;
  itemType?: ItemType;
  rarity?: Rarity;
  status?: InventoryItemStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetInventoryResponse {
  items: InventoryItem[];
  total: number;
  hasMore: boolean;
}

export interface UseItemRequest {
  itemId: string;
  quantity?: number;
}

export interface UseItemResponse {
  itemId: string;
  quantityUsed: number;
  remainingQuantity: number;
  result?: Record<string, unknown>;
}

export interface InventoryStats {
  totalItems: number;
  /* eslint-disable no-unused-vars */
  byCategory: {
    [key in ShopCategory]?: number;
  };
  byRarity: {
    [key in Rarity]?: number;
  };
  byStatus: {
    [key in InventoryItemStatus]?: number;
  };
  /* eslint-enable no-unused-vars */
}

export interface AddToInventoryRequest {
  userId: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  category: ShopCategory;
  rarity: Rarity;
  description: string;
  imageUrl?: string;
  quantity?: number;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface TransferItemRequest {
  targetUserId: string;
  itemId: string;
  quantity?: number;
}
