/**
 * Inventory - Service Layer
 * CV-MOD-010
 *
 * Implements business logic for inventory management including
 * viewing items, using items, and managing inventory.
 */

import {
  InventoryItem,
  InventoryItemStatus,
  ItemType,
  GetInventoryRequest,
  GetInventoryResponse,
  UseItemRequest,
  UseItemResponse,
  InventoryStats,
  AddToInventoryRequest,
  TransferItemRequest,
} from './inventory.types.js';
// ShopCategory and Rarity are used only in types, not in service logic
// No import needed

// In-memory store (will be replaced with PostgreSQL in production)
const inventoryItems = new Map<string, InventoryItem[]>(); // userId -> inventory items

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export class InventoryService {
  /**
   * Get inventory items for a user with filtering and pagination
   */
  async getInventory(userId: string, request: GetInventoryRequest): Promise<GetInventoryResponse> {
    let items = inventoryItems.get(userId) || [];

    // Filter by category
    if (request.category) {
      items = items.filter((item) => item.category === request.category);
    }

    // Filter by item type
    if (request.itemType) {
      items = items.filter((item) => item.itemType === request.itemType);
    }

    // Filter by rarity
    if (request.rarity) {
      items = items.filter((item) => item.rarity === request.rarity);
    }

    // Filter by status
    if (request.status) {
      items = items.filter((item) => item.status === request.status);
    }

    // Search by name or description
    if (request.search) {
      const searchLower = request.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by acquired date (newest first)
    items.sort((a, b) => b.acquiredAt.getTime() - a.acquiredAt.getTime());

    const total = items.length;
    const limit = request.limit || 20;
    const offset = request.offset || 0;
    const paginated = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      items: paginated,
      total,
      hasMore,
    };
  }

  /**
   * Get a specific inventory item
   */
  async getInventoryItem(userId: string, itemId: string): Promise<InventoryItem | null> {
    const items = inventoryItems.get(userId) || [];
    return items.find((item) => item.id === itemId) || null;
  }

  /**
   * Add an item to user's inventory
   */
  async addToInventory(userId: string, request: AddToInventoryRequest): Promise<InventoryItem> {
    // Check if item already exists (for stackable items)
    const existingItems = inventoryItems.get(userId) || [];
    const existing = existingItems.find(
      (item) => item.itemId === request.itemId && item.status === InventoryItemStatus.OWNED
    );

    if (existing && request.itemType === ItemType.CONSUMABLE) {
      // Increase quantity for consumable items
      existing.quantity += request.quantity || 1;
      inventoryItems.set(userId, existingItems);
      return existing;
    }

    // Create new inventory item
    const inventoryItem: InventoryItem = {
      id: generateId(),
      userId: request.userId,
      itemId: request.itemId,
      itemName: request.itemName,
      itemType: request.itemType,
      category: request.category,
      rarity: request.rarity,
      description: request.description,
      imageUrl: request.imageUrl,
      status: InventoryItemStatus.OWNED,
      quantity: request.quantity || 1,
      acquiredAt: new Date(),
      expiresAt: request.expiresAt,
      metadata: request.metadata,
    };

    existingItems.push(inventoryItem);
    inventoryItems.set(userId, existingItems);

    return inventoryItem;
  }

  /**
   * Use an item from inventory
   */
  async useItem(userId: string, request: UseItemRequest): Promise<UseItemResponse> {
    const items = inventoryItems.get(userId) || [];
    const itemIndex = items.findIndex((item) => item.id === request.itemId);

    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    const item = items[itemIndex];

    // Check if item is usable
    if (item.status !== InventoryItemStatus.OWNED && item.status !== InventoryItemStatus.EQUIPPED) {
      throw new Error(`Item is not usable (status: ${item.status})`);
    }

    if (item.itemType !== ItemType.CONSUMABLE && item.itemType !== ItemType.COLLECTIBLE) {
      throw new Error('Only consumable and collectible items can be used');
    }

    const quantityToUse = request.quantity || 1;
    if (item.quantity < quantityToUse) {
      throw new Error(
        `Insufficient quantity. Available: ${item.quantity}, Requested: ${quantityToUse}`
      );
    }

    // Update quantity
    item.quantity -= quantityToUse;

    // If quantity reaches 0, mark as consumed
    if (item.quantity === 0) {
      item.status = InventoryItemStatus.CONSUMED;
    }

    inventoryItems.set(userId, items);

    return {
      itemId: item.id,
      quantityUsed: quantityToUse,
      remainingQuantity: item.quantity,
      result: {
        itemName: item.itemName,
        category: item.category,
        rarity: item.rarity,
      },
    };
  }

  /**
   * Transfer an item to another user
   */
  async transferItem(userId: string, request: TransferItemRequest): Promise<void> {
    const items = inventoryItems.get(userId) || [];
    const itemIndex = items.findIndex((item) => item.id === request.itemId);

    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    const item = items[itemIndex];

    // Check if item is transferable
    if (item.status !== InventoryItemStatus.OWNED) {
      throw new Error(`Item cannot be transferred (status: ${item.status})`);
    }

    if (item.itemType === ItemType.COLLECTIBLE) {
      throw new Error('Collectible items cannot be transferred');
    }

    const quantityToTransfer = request.quantity || 1;
    if (item.quantity < quantityToTransfer) {
      throw new Error(
        `Insufficient quantity. Available: ${item.quantity}, Requested: ${quantityToTransfer}`
      );
    }

    // Remove from current user
    item.quantity -= quantityToTransfer;
    if (item.quantity === 0) {
      items.splice(itemIndex, 1);
    }
    inventoryItems.set(userId, items);

    // Add to target user
    const targetItems = inventoryItems.get(request.targetUserId) || [];
    const existingTarget = targetItems.find(
      (invItem) => invItem.itemId === request.itemId && invItem.status === InventoryItemStatus.OWNED
    );

    if (existingTarget && item.itemType === ItemType.CONSUMABLE) {
      existingTarget.quantity += quantityToTransfer;
      inventoryItems.set(request.targetUserId, targetItems);
    } else {
      const transferredItem: InventoryItem = {
        ...item,
        id: generateId(),
        userId: request.targetUserId,
        quantity: quantityToTransfer,
        acquiredAt: new Date(),
      };
      targetItems.push(transferredItem);
      inventoryItems.set(request.targetUserId, targetItems);
    }
  }

  /**
   * Get inventory statistics
   */
  async getStats(userId: string): Promise<InventoryStats> {
    const items = inventoryItems.get(userId) || [];

    const stats: InventoryStats = {
      totalItems: items.length,
      byCategory: {},
      byRarity: {},
      byStatus: {},
    };

    for (const item of items) {
      // By category
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;

      // By rarity
      stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;

      // By status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Equip an item from inventory
   */
  async equipItem(userId: string, itemId: string): Promise<void> {
    const items = inventoryItems.get(userId) || [];
    const item = items.find((invItem) => invItem.id === itemId);

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    if (item.status !== InventoryItemStatus.OWNED) {
      throw new Error(`Item cannot be equipped (status: ${item.status})`);
    }

    if (item.itemType !== ItemType.COSMETIC) {
      throw new Error('Only cosmetic items can be equipped');
    }

    // Unequip any item in the same category
    for (const invItem of items) {
      if (invItem.category === item.category && invItem.status === InventoryItemStatus.EQUIPPED) {
        invItem.status = InventoryItemStatus.OWNED;
      }
    }

    // Equip the item
    item.status = InventoryItemStatus.EQUIPPED;
    inventoryItems.set(userId, items);
  }

  /**
   * Unequip an item
   */
  async unequipItem(userId: string, itemId: string): Promise<void> {
    const items = inventoryItems.get(userId) || [];
    const item = items.find((invItem) => invItem.id === itemId);

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    if (item.status !== InventoryItemStatus.EQUIPPED) {
      throw new Error('Item is not currently equipped');
    }

    item.status = InventoryItemStatus.OWNED;
    inventoryItems.set(userId, items);
  }

  /**
   * Get equipped items for a user
   */
  async getEquippedItems(userId: string): Promise<InventoryItem[]> {
    const items = inventoryItems.get(userId) || [];
    return items.filter((item) => item.status === InventoryItemStatus.EQUIPPED);
  }

  /**
   * Check if user owns a specific item
   */
  async userOwnsItem(userId: string, itemId: string): Promise<boolean> {
    const items = inventoryItems.get(userId) || [];
    return items.some((item) => item.itemId === itemId);
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
