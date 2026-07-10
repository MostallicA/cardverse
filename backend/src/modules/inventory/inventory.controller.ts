/**
 * Inventory - Controller Layer
 * CV-MOD-010
 *
 * Handles HTTP requests for inventory management including viewing items,
 * using items, and transferring items.
 */

import { Request, Response } from 'express';

import { ShopCategory, Rarity } from '../shop/shop.types';
import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils';

import { validateGetInventory, validateUseItem, validateTransferItem } from './inventory.validator';
import { inventoryService } from './inventory.service';
import { ItemType, InventoryItemStatus } from './inventory.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class InventoryController {
  /**
   * Get inventory items for current user
   * GET /api/v1/inventory
   */
  getInventory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
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
        return sendError(res, 'Validation failed', 400, validation.errors);
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

      return sendSuccess(res, result, 'Inventory retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get inventory',
        500
      );
    }
  };

  /**
   * Get a specific inventory item
   * GET /api/v1/inventory/:itemId
   */
  getInventoryItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const itemId = getRequiredParamString(req.params.itemId, 'itemId');

      const item = await inventoryService.getInventoryItem(userId, itemId);
      if (!item) {
        return sendError(res, 'Item not found in inventory', 404);
      }

      return sendSuccess(res, item, 'Inventory item retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get inventory item',
        500
      );
    }
  };

  /**
   * Use an item from inventory
   * POST /api/v1/inventory/use
   */
  useItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateUseItem(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const result = await inventoryService.useItem(userId, req.body);
      return sendSuccess(res, result, 'Item used successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to use item', 500);
    }
  };

  /**
   * Transfer an item to another user
   * POST /api/v1/inventory/transfer
   */
  transferItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateTransferItem(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      await inventoryService.transferItem(userId, req.body);
      return sendSuccess(res, null, 'Item transferred successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to transfer item',
        500
      );
    }
  };

  /**
   * Get inventory statistics
   * GET /api/v1/inventory/stats
   */
  getStats = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const stats = await inventoryService.getStats(userId);
      return sendSuccess(res, stats, 'Inventory statistics retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get statistics',
        500
      );
    }
  };

  /**
   * Get equipped items
   * GET /api/v1/inventory/equipped
   */
  getEquippedItems = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const items = await inventoryService.getEquippedItems(userId);
      return sendSuccess(res, { items }, 'Equipped items retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get equipped items',
        500
      );
    }
  };

  /**
   * Equip an item
   * POST /api/v1/inventory/equip
   */
  equipItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { itemId } = req.body;
      if (!itemId) {
        return sendError(res, 'itemId is required', 400);
      }

      await inventoryService.equipItem(userId, itemId);
      return sendSuccess(res, null, 'Item equipped successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to equip item', 500);
    }
  };

  /**
   * Unequip an item
   * POST /api/v1/inventory/unequip
   */
  unequipItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { itemId } = req.body;
      if (!itemId) {
        return sendError(res, 'itemId is required', 400);
      }

      await inventoryService.unequipItem(userId, itemId);
      return sendSuccess(res, null, 'Item unequipped successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to unequip item', 500);
    }
  };
}

// Export singleton instance
export const inventoryController = new InventoryController();
