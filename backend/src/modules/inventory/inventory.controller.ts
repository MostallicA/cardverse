/**
 * Inventory - Controller Layer
 * CV-MOD-010
 *
 * Handles HTTP requests for inventory management including viewing items,
 * using items, and transferring items.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ShopCategory, Rarity } from '../shop/shop.types';

import {
  validateGetInventory,
  validateUseItem,
  validateTransferItem,
  validateItemId,
} from './inventory.validator';
import { inventoryService } from './inventory.service';
import { ItemType, InventoryItemStatus } from './inventory.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class InventoryController {
  /**
   * Get inventory items for current user
   * GET /api/v1/inventory
   */
  getInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const category = req.query.category as ShopCategory | undefined;
    const itemType = req.query.itemType as ItemType | undefined;
    const rarity = req.query.rarity as Rarity | undefined;
    const status = req.query.status as InventoryItemStatus | undefined;
    const search = req.query.search as string | undefined;

    // Validate query
    const validation = validateGetInventory({
      limit,
      offset,
      category,
      itemType,
      rarity,
      status,
      search,
    });
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await inventoryService.getInventory(userId, {
      limit,
      offset,
      category,
      itemType,
      rarity,
      status,
      search,
    });

    return successResponse(res, result, 'Inventory retrieved successfully');
  });

  /**
   * Get a specific inventory item
   * GET /api/v1/inventory/:itemId
   */
  getInventoryItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

    const item = await inventoryService.getInventoryItem(userId, itemId);
    if (!item) {
      return errorResponse(res, 'Item not found in inventory', 404);
    }

    return successResponse(res, item, 'Inventory item retrieved successfully');
  });

  /**
   * Use an item from inventory
   * POST /api/v1/inventory/use
   */
  useItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateUseItem(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await inventoryService.useItem(userId, req.body);
    return successResponse(res, result, 'Item used successfully');
  });

  /**
   * Transfer an item to another user
   * POST /api/v1/inventory/transfer
   */
  transferItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateTransferItem(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await inventoryService.transferItem(userId, req.body);
    return successResponse(res, null, 'Item transferred successfully');
  });

  /**
   * Get inventory statistics
   * GET /api/v1/inventory/stats
   */
  getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const stats = await inventoryService.getStats(userId);
    return successResponse(res, stats, 'Inventory statistics retrieved successfully');
  });

  /**
   * Get equipped items
   * GET /api/v1/inventory/equipped
   */
  getEquippedItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const items = await inventoryService.getEquippedItems(userId);
    return successResponse(res, { items }, 'Equipped items retrieved successfully');
  });

  /**
   * Equip an item
   * POST /api/v1/inventory/equip
   */
  equipItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { itemId } = req.body;
    if (!itemId) {
      return errorResponse(res, 'itemId is required', 400);
    }

    await inventoryService.equipItem(userId, itemId);
    return successResponse(res, null, 'Item equipped successfully');
  });

  /**
   * Unequip an item
   * POST /api/v1/inventory/unequip
   */
  unequipItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { itemId } = req.body;
    if (!itemId) {
      return errorResponse(res, 'itemId is required', 400);
    }

    await inventoryService.unequipItem(userId, itemId);
    return successResponse(res, null, 'Item unequipped successfully');
  });
}

// Export singleton instance
export const inventoryController = new InventoryController();
