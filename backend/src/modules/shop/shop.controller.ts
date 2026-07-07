/**
 * Shop - Controller Layer
 * CV-MOD-009
 *
 * Handles HTTP requests for shop system including browsing items,
 * purchasing items, and managing user inventory.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { shopService } from './shop.service';
import {
  validatePurchase,
  validateGetShopItems,
  validateItemId,
  validateEquipItem,
} from './shop.validator';
import { ShopCategory, Rarity } from './shop.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class ShopController {
  /**
   * Get all shop items with filtering and pagination
   * GET /api/v1/shop/items
   */
  getShopItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const category = req.query.category as ShopCategory | undefined;
    const rarity = req.query.rarity as Rarity | undefined;
    const search = req.query.search as string | undefined;

    // Validate query
    const validation = validateGetShopItems({ limit, offset, category, rarity, search });
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await shopService.getShopItems({
      limit,
      offset,
      category,
      rarity,
      search,
    });

    return successResponse(res, result, 'Shop items retrieved successfully');
  });

  /**
   * Get a specific shop item by ID
   * GET /api/v1/shop/items/:itemId
   */
  getShopItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { itemId } = req.params;

    // Validate itemId
    const validation = validateItemId(itemId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const item = await shopService.getShopItem(itemId);
    if (!item) {
      return errorResponse(res, 'Item not found', 404);
    }

    return successResponse(res, item, 'Shop item retrieved successfully');
  });

  /**
   * Purchase an item from the shop
   * POST /api/v1/shop/purchase
   */
  purchaseItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validatePurchase(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await shopService.purchaseItem(userId, req.body);
    return successResponse(res, result, 'Item purchased successfully');
  });

  /**
   * Get user inventory
   * GET /api/v1/shop/inventory
   */
  getInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const category = req.query.category as ShopCategory | undefined;
    const inventory = await shopService.getUserInventory(userId, category);

    return successResponse(res, inventory, 'Inventory retrieved successfully');
  });

  /**
   * Equip an item
   * POST /api/v1/shop/equip
   */
  equipItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateEquipItem(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await shopService.equipItem(userId, req.body);
    return successResponse(res, null, 'Item equipped successfully');
  });

  /**
   * Unequip an item
   * POST /api/v1/shop/unequip
   */
  unequipItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateEquipItem(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await shopService.unequipItem(userId, req.body);
    return successResponse(res, null, 'Item unequipped successfully');
  });

  /**
   * Get equipped items
   * GET /api/v1/shop/equipped
   */
  getEquippedItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const equipped = await shopService.getEquippedItems(userId);
    const result = Object.fromEntries(equipped);
    return successResponse(res, result, 'Equipped items retrieved successfully');
  });
}

// Export singleton instance
export const shopController = new ShopController();
