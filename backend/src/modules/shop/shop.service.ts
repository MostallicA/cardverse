/**
 * Shop - Service Layer
 * CV-MOD-009
 *
 * Implements business logic for shop system including item management,
 * purchases, and user inventory.
 */

import { walletService } from '../wallet/wallet.service.js';
import { TransactionSource } from '../wallet/wallet.types.js';

import {
  ShopItem,
  ShopCategory,
  Rarity,
  PurchaseRequest,
  PurchaseResponse,
  ShopItemResponse,
  GetShopItemsRequest,
  GetShopItemsResponse,
  UserInventoryItem,
  GetInventoryResponse,
  EquipItemRequest,
} from './shop.types.js';

// In-memory stores (will be replaced with PostgreSQL in production)
const shopItems = new Map<string, ShopItem>(); // itemId -> ShopItem
const userInventory = new Map<string, UserInventoryItem[]>(); // userId -> inventory items
const equippedItems = new Map<string, Map<ShopCategory, string>>(); // userId -> (category -> itemId)

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Seed initial shop items
function seedShopItems(): void {
  const items: ShopItem[] = [
    // Avatars
    {
      id: generateId(),
      name: 'Classic Avatar',
      description: 'Default classic avatar',
      category: ShopCategory.AVATAR,
      rarity: Rarity.COMMON,
      price: 0,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Cool Avatar',
      description: 'Cool and stylish avatar',
      category: ShopCategory.AVATAR,
      rarity: Rarity.UNCOMMON,
      price: 50,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Legendary Avatar',
      description: 'Legendary avatar for champions',
      category: ShopCategory.AVATAR,
      rarity: Rarity.LEGENDARY,
      price: 500,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Frames
    {
      id: generateId(),
      name: 'Bronze Frame',
      description: 'Bronze profile frame',
      category: ShopCategory.FRAME,
      rarity: Rarity.COMMON,
      price: 30,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Silver Frame',
      description: 'Silver profile frame',
      category: ShopCategory.FRAME,
      rarity: Rarity.UNCOMMON,
      price: 100,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Gold Frame',
      description: 'Gold profile frame',
      category: ShopCategory.FRAME,
      rarity: Rarity.RARE,
      price: 300,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Card Backs
    {
      id: generateId(),
      name: 'Red Card Back',
      description: 'Classic red card back',
      category: ShopCategory.CARD_BACK,
      rarity: Rarity.COMMON,
      price: 20,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Blue Card Back',
      description: 'Elegant blue card back',
      category: ShopCategory.CARD_BACK,
      rarity: Rarity.UNCOMMON,
      price: 80,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'Gold Card Back',
      description: 'Premium gold card back',
      category: ShopCategory.CARD_BACK,
      rarity: Rarity.EPIC,
      price: 400,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const item of items) {
    shopItems.set(item.id, item);
  }
}

// Seed on initialization
seedShopItems();

export class ShopService {
  /**
   * Get all shop items with filtering and pagination
   */
  async getShopItems(request: GetShopItemsRequest): Promise<GetShopItemsResponse> {
    let items = Array.from(shopItems.values());

    // Filter by category
    if (request.category) {
      items = items.filter((item) => item.category === request.category);
    }

    // Filter by rarity
    if (request.rarity) {
      items = items.filter((item) => item.rarity === request.rarity);
    }

    // Search by name
    if (request.search) {
      const searchLower = request.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter available items
    items = items.filter((item) => item.isAvailable);

    // Sort by price
    items.sort((a, b) => a.price - b.price);

    const total = items.length;
    const limit = request.limit || 20;
    const offset = request.offset || 0;
    const paginated = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      items: paginated.map((item) => this.toResponse(item)),
      total,
      hasMore,
    };
  }

  /**
   * Get a specific shop item by ID
   */
  async getShopItem(itemId: string): Promise<ShopItemResponse | null> {
    const item = shopItems.get(itemId);
    if (!item || !item.isAvailable) {
      return null;
    }
    return this.toResponse(item);
  }

  /**
   * Purchase an item from the shop
   */
  async purchaseItem(userId: string, request: PurchaseRequest): Promise<PurchaseResponse> {
    const item = shopItems.get(request.itemId);
    if (!item) {
      throw new Error('Item not found');
    }
    if (!item.isAvailable) {
      throw new Error('Item is not available for purchase');
    }

    // Check if user already owns this item
    const userItems = userInventory.get(userId) || [];
    if (userItems.some((invItem) => invItem.itemId === request.itemId)) {
      throw new Error('You already own this item');
    }

    // Check if user has enough coins
    const hasBalance = await walletService.hasSufficientBalance(userId, item.price);
    if (!hasBalance) {
      throw new Error(`Insufficient balance. Required: ${item.price} coins`);
    }

    // Spend coins
    await walletService.spendCoins(userId, {
      amount: item.price,
      source: TransactionSource.SHOP_PURCHASE,
      description: `Purchased: ${item.name}`,
      metadata: { itemId: item.id, itemName: item.name, category: item.category },
    });

    // Add to inventory
    const inventoryItem: UserInventoryItem = {
      id: generateId(),
      userId,
      itemId: item.id,
      itemName: item.name,
      itemCategory: item.category,
      itemRarity: item.rarity,
      itemImageUrl: item.imageUrl,
      purchasedAt: new Date(),
      isEquipped: false,
    };

    userItems.push(inventoryItem);
    userInventory.set(userId, userItems);

    return {
      itemId: item.id,
      userId,
      price: item.price,
      purchasedAt: new Date(),
    };
  }

  /**
   * Get user inventory
   */
  async getUserInventory(userId: string, category?: ShopCategory): Promise<GetInventoryResponse> {
    let items = userInventory.get(userId) || [];

    // Filter by category
    if (category) {
      items = items.filter((item) => item.itemCategory === category);
    }

    // Sort by purchased date (newest first)
    items.sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());

    return {
      items,
      total: items.length,
      hasMore: false, // Will implement pagination later
    };
  }

  /**
   * Equip an item
   */
  async equipItem(userId: string, request: EquipItemRequest): Promise<void> {
    const userItems = userInventory.get(userId) || [];
    const inventoryItem = userItems.find((item) => item.itemId === request.itemId);
    if (!inventoryItem) {
      throw new Error('Item not found in inventory');
    }

    // Get or create user equipped map
    let userEquipped = equippedItems.get(userId);
    if (!userEquipped) {
      userEquipped = new Map<ShopCategory, string>();
      equippedItems.set(userId, userEquipped);
    }

    // Unequip previous item in same category
    const previousItemId = userEquipped.get(inventoryItem.itemCategory);
    if (previousItemId) {
      const previousItem = userItems.find((item) => item.itemId === previousItemId);
      if (previousItem) {
        previousItem.isEquipped = false;
      }
    }

    // Equip new item
    inventoryItem.isEquipped = true;
    userEquipped.set(inventoryItem.itemCategory, inventoryItem.itemId);
    userInventory.set(userId, userItems);
  }

  /**
   * Unequip an item
   */
  async unequipItem(userId: string, request: EquipItemRequest): Promise<void> {
    const userItems = userInventory.get(userId) || [];
    const inventoryItem = userItems.find((item) => item.itemId === request.itemId);
    if (!inventoryItem) {
      throw new Error('Item not found in inventory');
    }

    if (!inventoryItem.isEquipped) {
      throw new Error('Item is not equipped');
    }

    inventoryItem.isEquipped = false;
    userInventory.set(userId, userItems);

    const userEquipped = equippedItems.get(userId);
    if (userEquipped) {
      userEquipped.delete(inventoryItem.itemCategory);
    }
  }

  /**
   * Get equipped items for a user
   */
  async getEquippedItems(userId: string): Promise<Map<ShopCategory, string>> {
    return equippedItems.get(userId) || new Map<ShopCategory, string>();
  }

  /**
   * Check if user owns an item
   */
  async userOwnsItem(userId: string, itemId: string): Promise<boolean> {
    const userItems = userInventory.get(userId) || [];
    return userItems.some((item) => item.itemId === itemId);
  }

  /**
   * Convert ShopItem to ShopItemResponse
   */
  private toResponse(item: ShopItem): ShopItemResponse {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      rarity: item.rarity,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
    };
  }
}

// Export singleton instance
export const shopService = new ShopService();
