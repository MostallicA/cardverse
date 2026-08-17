/**
 * Shop - Service Layer
 * CV-MOD-009
 *
 * Implements business logic for shop system including item management,
 * purchases, and user inventory.
 * Now uses Prisma for persistence.
 */

import { prisma } from '../../db/prisma.js';
import { walletService } from '../wallet/wallet.service.js';
import { TransactionSource } from '../wallet/wallet.types.js';

import {
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

export class ShopService {
  /**
   * Get all shop items with filtering and pagination
   */
  async getShopItems(request: GetShopItemsRequest): Promise<GetShopItemsResponse> {
    // Build where clause
    const where: any = {
      isAvailable: true,
    };

    if (request.category) {
      where.category = request.category;
    }

    if (request.rarity) {
      where.rarity = request.rarity;
    }

    if (request.search) {
      where.OR = [
        { name: { contains: request.search, mode: 'insensitive' } },
        { description: { contains: request.search, mode: 'insensitive' } },
      ];
    }

    const limit = request.limit || 20;
    const offset = request.offset || 0;

    // Get total count
    const total = await prisma.shopItem.count({ where });

    // Get paginated items
    const items = await prisma.shopItem.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        price: 'asc',
      },
    });

    const hasMore = offset + limit < total;

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      hasMore,
    };
  }

  /**
   * Get a specific shop item by ID
   */
  async getShopItem(itemId: string): Promise<ShopItemResponse | null> {
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isAvailable) {
      return null;
    }

    return this.toResponse(item);
  }

  /**
   * Purchase an item from the shop
   */
  async purchaseItem(userId: string, request: PurchaseRequest): Promise<PurchaseResponse> {
    const item = await prisma.shopItem.findUnique({
      where: { id: request.itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    if (!item.isAvailable) {
      throw new Error('Item is not available for purchase');
    }

    // Check if user already owns this item
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        userId,
        itemId: request.itemId,
      },
    });

    if (existingInventory) {
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
    await prisma.inventory.create({
      data: {
        userId,
        itemId: item.id,
        itemType: item.category,
        quantity: 1,
        isEquipped: false,
      },
    });

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
    const where: any = {
      userId,
    };

    if (category) {
      where.itemType = category;
    }

    const items = await prisma.inventory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const shopItems = await prisma.shopItem.findMany({
      where: {
        id: { in: items.map((item) => item.itemId) },
      },
    });

    const shopItemMap = new Map(shopItems.map((item) => [item.id, item]));

    const userInventoryItems: UserInventoryItem[] = items.map((item) => {
      const shopItem = shopItemMap.get(item.itemId);
      return {
        id: item.id,
        userId: item.userId,
        itemId: item.itemId,
        itemName: shopItem?.name || item.itemId,
        itemCategory: item.itemType as ShopCategory,
        itemRarity: (shopItem?.rarity as Rarity) || Rarity.COMMON,
        itemImageUrl: shopItem?.imageUrl || undefined,
        purchasedAt: item.createdAt,
        isEquipped: item.isEquipped,
      };
    });

    return {
      items: userInventoryItems,
      total: userInventoryItems.length,
      hasMore: false,
    };
  }

  /**
   * Equip an item
   */
  async equipItem(userId: string, request: EquipItemRequest): Promise<void> {
    // Find the inventory item
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        userId,
        itemId: request.itemId,
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not found in inventory');
    }

    // Get the shop item to know its category
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: request.itemId },
    });

    if (!shopItem) {
      throw new Error('Shop item not found');
    }

    // Unequip any item in the same category
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

    // Equip the new item
    await prisma.inventory.update({
      where: {
        id: inventoryItem.id,
      },
      data: {
        isEquipped: true,
      },
    });
  }

  /**
   * Unequip an item
   */
  async unequipItem(userId: string, request: EquipItemRequest): Promise<void> {
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        userId,
        itemId: request.itemId,
        isEquipped: true,
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not found or is not equipped');
    }

    await prisma.inventory.update({
      where: {
        id: inventoryItem.id,
      },
      data: {
        isEquipped: false,
      },
    });
  }

  /**
   * Get equipped items for a user
   */
  async getEquippedItems(userId: string): Promise<Map<ShopCategory, string>> {
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

    const equipped = new Map<ShopCategory, string>();
    for (const item of items) {
      const shopItem = shopItemMap.get(item.itemId);
      if (shopItem) {
        equipped.set(shopItem.category as ShopCategory, item.itemId);
      }
    }

    return equipped;
  }

  /**
   * Check if user owns an item
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

  /**
   * Convert ShopItem to ShopItemResponse
   */
  private toResponse(item: any): ShopItemResponse {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category as ShopCategory,
      rarity: item.rarity as Rarity,
      price: item.price,
      imageUrl: item.imageUrl || undefined,
      isAvailable: item.isAvailable,
    };
  }
}

// Export singleton instance
export const shopService = new ShopService();
