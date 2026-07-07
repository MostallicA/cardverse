/**
 * Shop - Type Definitions
 * CV-MOD-009
 *
 * Defines types and interfaces for shop system including
 * shop items, categories, and purchases.
 */

/* eslint-disable no-unused-vars */
export enum ShopCategory {
  AVATAR = 'avatar',
  FRAME = 'frame',
  CARD_BACK = 'card_back',
  TABLE_THEME = 'table_theme',
  PROFILE_DECORATION = 'profile_decoration',
  EMOTE = 'emote',
  TITLE = 'title',
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}
/* eslint-enable no-unused-vars */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity: Rarity;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequest {
  itemId: string;
}

export interface PurchaseResponse {
  itemId: string;
  userId: string;
  price: number;
  purchasedAt: Date;
}

export interface ShopItemResponse {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity: Rarity;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface GetShopItemsRequest {
  category?: ShopCategory;
  rarity?: Rarity;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface GetShopItemsResponse {
  items: ShopItemResponse[];
  total: number;
  hasMore: boolean;
}

export interface UserInventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  itemCategory: ShopCategory;
  itemRarity: Rarity;
  itemImageUrl?: string;
  purchasedAt: Date;
  isEquipped: boolean;
}

export interface GetInventoryResponse {
  items: UserInventoryItem[];
  total: number;
  hasMore: boolean;
}

export interface EquipItemRequest {
  itemId: string;
}

export interface UnequipItemRequest {
  itemId: string;
}
