/**
 * Inventory - Service Layer
 * CV-MOD-010
 *
 * Implements business logic for inventory management including
 * viewing items, using items, and managing inventory.
 * Now uses Prisma for persistence.
 */

import { prisma } from '../../db/prisma.js';
import { ShopCategory, Rarity } from '../shop/shop.types.js';

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

export class InventoryService {
  /**
   * Get inventory items for a user with filtering and pagination
   */
  async getInventory(userId: string, request: GetInventoryRequest): Promise<GetInventoryResponse> {
    const where: any = {
      userId,
    };

    if (request.category) {
      where.itemType = request.category;
    }

    if (request.status) {
      where.isEquipped = request.status === InventoryItemStatus.EQUIPPED;
    }

    const limit = request.limit || 20;
    const offset = request.offset || 0;

    const total = await prisma.inventory.count({ where });

    const items = await prisma.inventory.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = offset + limit < total;

    // Get shop item details
    const shopItems = await prisma.shopItem.findMany({
      where: {
        id: { in: items.map((item) => item.itemId) },
      },
    });

    const shopItemMap = new Map(shopItems.map((item) => [item.id, item]));

    const inventoryItems: InventoryItem[] = items.map((item) => {
      const shopItem = shopItemMap.get(item.itemId);
      return {
        id: item.id,
        userId: item.userId,
        itemId: item.itemId,
        itemName: shopItem?.name || item.itemId,
        itemType: item.itemType as ItemType,
        category: (shopItem?.category as ShopCategory) || (item.itemType as ShopCategory),
        rarity: (shopItem?.rarity as Rarity) || Rarity.COMMON,
        description: shopItem?.description || '',
        imageUrl: shopItem?.imageUrl || undefined,
        status: item.isEquipped ? InventoryItemStatus.EQUIPPED : InventoryItemStatus.OWNED,
        quantity: item.quantity,
        acquiredAt: item.createdAt,
        expiresAt: undefined,
        metadata: {},
      };
    });

    return {
      items: inventoryItems,
      total,
      hasMore,
    };
  }

  /**
   * Get a specific inventory item
   */
  async getInventoryItem(userId: string, itemId: string): Promise<InventoryItem | null> {
    const item = await prisma.inventory.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      return null;
    }

    const shopItem = await prisma.shopItem.findUnique({
      where: { id: item.itemId },
    });

    return {
      id: item.id,
      userId: item.userId,
      itemId: item.itemId,
      itemName: shopItem?.name || item.itemId,
      itemType: item.itemType as ItemType,
      category: (shopItem?.category as ShopCategory) || (item.itemType as ShopCategory),
      rarity: (shopItem?.rarity as Rarity) || Rarity.COMMON,
      description: shopItem?.description || '',
      imageUrl: shopItem?.imageUrl || undefined,
      status: item.isEquipped ? InventoryItemStatus.EQUIPPED : InventoryItemStatus.OWNED,
      quantity: item.quantity,
      acquiredAt: item.createdAt,
      expiresAt: undefined,
      metadata: {},
    };
  }

  /**
   * Add an item to user's inventory
   */
  async addToInventory(userId: string, request: AddToInventoryRequest): Promise<InventoryItem> {
    // Check if item already exists
    const existing = await prisma.inventory.findFirst({
      where: {
        userId,
        itemId: request.itemId,
      },
    });

    if (existing && request.itemType === ItemType.CONSUMABLE) {
      // Increase quantity for consumable items
      const updated = await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: request.quantity || 1 },
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        itemId: updated.itemId,
        itemName: request.itemName,
        itemType: request.itemType,
        category: request.category,
        rarity: request.rarity,
        description: request.description,
        imageUrl: request.imageUrl,
        status: InventoryItemStatus.OWNED,
        quantity: updated.quantity,
        acquiredAt: updated.createdAt,
        expiresAt: request.expiresAt,
        metadata: request.metadata || {},
      };
    }

    // Create new inventory item
    const created = await prisma.inventory.create({
      data: {
        userId,
        itemId: request.itemId,
        itemType: request.category,
        quantity: request.quantity || 1,
        isEquipped: false,
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      itemId: created.itemId,
      itemName: request.itemName,
      itemType: request.itemType,
      category: request.category,
      rarity: request.rarity,
      description: request.description,
      imageUrl: request.imageUrl,
      status: InventoryItemStatus.OWNED,
      quantity: created.quantity,
      acquiredAt: created.createdAt,
      expiresAt: request.expiresAt,
      metadata: request.metadata || {},
    };
  }

  /**
   * Use an item from inventory
   */
  async useItem(userId: string, request: UseItemRequest): Promise<UseItemResponse> {
    const item = await prisma.inventory.findFirst({
      where: {
        id: request.itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    if (item.quantity < (request.quantity || 1)) {
      throw new Error(`Insufficient quantity. Available: ${item.quantity}`);
    }

    // For now, just reduce quantity
    // Future: Add item-specific logic
    const newQuantity = item.quantity - (request.quantity || 1);
    const updated = await prisma.inventory.update({
      where: { id: item.id },
      data: {
        quantity: newQuantity,
      },
    });

    const shopItem = await prisma.shopItem.findUnique({
      where: { id: item.itemId },
    });

    return {
      itemId: item.id,
      quantityUsed: request.quantity || 1,
      remainingQuantity: updated.quantity,
      result: {
        itemName: shopItem?.name || item.itemId,
        category: item.itemType as ShopCategory,
        rarity: (shopItem?.rarity as Rarity) || Rarity.COMMON,
      },
    };
  }

  /**
   * Transfer an item to another user
   */
  async transferItem(userId: string, request: TransferItemRequest): Promise<void> {
    const item = await prisma.inventory.findFirst({
      where: {
        id: request.itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    if (item.quantity < (request.quantity || 1)) {
      throw new Error(`Insufficient quantity. Available: ${item.quantity}`);
    }

    // Reduce quantity from sender
    const newQuantity = item.quantity - (request.quantity || 1);
    if (newQuantity === 0) {
      await prisma.inventory.delete({ where: { id: item.id } });
    } else {
      await prisma.inventory.update({
        where: { id: item.id },
        data: { quantity: newQuantity },
      });
    }

    // Add to target user
    const targetItem = await prisma.inventory.findFirst({
      where: {
        userId: request.targetUserId,
        itemId: item.itemId,
      },
    });

    if (targetItem) {
      await prisma.inventory.update({
        where: { id: targetItem.id },
        data: {
          quantity: { increment: request.quantity || 1 },
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          userId: request.targetUserId,
          itemId: item.itemId,
          itemType: item.itemType,
          quantity: request.quantity || 1,
          isEquipped: false,
        },
      });
    }
  }

  /**
   * Get inventory statistics
   */
  async getStats(userId: string): Promise<InventoryStats> {
    const items = await prisma.inventory.findMany({
      where: { userId },
    });

    const stats: InventoryStats = {
      totalItems: items.length,
      byCategory: {},
      byRarity: {},
      byStatus: {},
    };

    // Get shop items for details
    const shopItems = await prisma.shopItem.findMany({
      where: {
        id: { in: items.map((item) => item.itemId) },
      },
    });

    const shopItemMap = new Map(shopItems.map((item) => [item.id, item]));

    for (const item of items) {
      const shopItem = shopItemMap.get(item.itemId);
      const category = (shopItem?.category || item.itemType) as ShopCategory;
      const rarity = (shopItem?.rarity || Rarity.COMMON) as Rarity;
      const status = item.isEquipped ? InventoryItemStatus.EQUIPPED : InventoryItemStatus.OWNED;

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Equip an item from inventory
   */
  async equipItem(userId: string, itemId: string): Promise<void> {
    const item = await prisma.inventory.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    // Get shop item for category
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: item.itemId },
    });

    if (!shopItem) {
      throw new Error('Shop item not found');
    }

    // Unequip any item in same category
    await prisma.inventory.updateMany({
      where: {
        userId,
        itemType: shopItem.category,
        isEquipped: true,
      },
      data: {
        isEquipped: false,
      },
    });

    // Equip the item
    await prisma.inventory.update({
      where: { id: item.id },
      data: {
        isEquipped: true,
      },
    });
  }

  /**
   * Unequip an item
   */
  async unequipItem(userId: string, itemId: string): Promise<void> {
    const item = await prisma.inventory.findFirst({
      where: {
        id: itemId,
        userId,
        isEquipped: true,
      },
    });

    if (!item) {
      throw new Error('Item not found or is not equipped');
    }

    await prisma.inventory.update({
      where: { id: item.id },
      data: {
        isEquipped: false,
      },
    });
  }

  /**
   * Get equipped items for a user
   */
  async getEquippedItems(userId: string): Promise<InventoryItem[]> {
    const items = await prisma.inventory.findMany({
      where: {
        userId,
        isEquipped: true,
      },
    });

    const shopItems = await prisma.shopItem.findMany({
      where: {
        id: { in: items.map((item) => item.itemId) },
      },
    });

    const shopItemMap = new Map(shopItems.map((item) => [item.id, item]));

    return items.map((item) => {
      const shopItem = shopItemMap.get(item.itemId);
      return {
        id: item.id,
        userId: item.userId,
        itemId: item.itemId,
        itemName: shopItem?.name || item.itemId,
        itemType: item.itemType as ItemType,
        category: (shopItem?.category as ShopCategory) || (item.itemType as ShopCategory),
        rarity: (shopItem?.rarity as Rarity) || Rarity.COMMON,
        description: shopItem?.description || '',
        imageUrl: shopItem?.imageUrl || undefined,
        status: InventoryItemStatus.EQUIPPED,
        quantity: item.quantity,
        acquiredAt: item.createdAt,
        expiresAt: undefined,
        metadata: {},
      };
    });
  }

  /**
   * Check if user owns a specific item
   */
  async userOwnsItem(userId: string, itemId: string): Promise<boolean> {
    const item = await prisma.inventory.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    return !!item;
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
