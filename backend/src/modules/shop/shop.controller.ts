/**
 * Shop - Controller Layer
 * CV-MOD-009
 *
 * Handles HTTP requests for shop system including browsing items,
 * purchasing items, and managing user inventory.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils.js';

import { shopService } from './shop.service.js';
import { validatePurchase, validateGetShopItems, validateEquipItem } from './shop.validator.js';
import { ShopCategory, Rarity } from './shop.types.js';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class ShopController {
  /**
   * Get all shop items with filtering and pagination
   * GET /api/v1/shop/items
   */
  getShopItems = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
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
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const result = await shopService.getShopItems({
        limit,
        offset,
        category,
        rarity,
        search,
      });

      return sendSuccess(res, result, 'Shop items retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get shop items',
        500
      );
    }
  };

  /**
   * Get a specific shop item by ID
   * GET /api/v1/shop/items/:itemId
   */
  getShopItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const itemId = getRequiredParamString(req.params.itemId, 'itemId');

      const item = await shopService.getShopItem(itemId);
      if (!item) {
        return sendError(res, 'Item not found', 404);
      }

      return sendSuccess(res, item, 'Shop item retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get shop item',
        500
      );
    }
  };

  /**
   * Purchase an item from the shop
   * POST /api/v1/shop/purchase
   */
  purchaseItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validatePurchase(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const result = await shopService.purchaseItem(userId, req.body);
      return sendSuccess(res, result, 'Item purchased successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to purchase item',
        500
      );
    }
  };

  /**
   * Get user inventory
   * GET /api/v1/shop/inventory
   */
  getInventory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const category = req.query.category as ShopCategory | undefined;
      const inventory = await shopService.getUserInventory(userId, category);

      return sendSuccess(res, inventory, 'Inventory retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get inventory',
        500
      );
    }
  };

  /**
   * Equip an item
   * POST /api/v1/shop/equip
   */
  equipItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateEquipItem(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      await shopService.equipItem(userId, req.body);
      return sendSuccess(res, null, 'Item equipped successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to equip item', 500);
    }
  };

  /**
   * Unequip an item
   * POST /api/v1/shop/unequip
   */
  unequipItem = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateEquipItem(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      await shopService.unequipItem(userId, req.body);
      return sendSuccess(res, null, 'Item unequipped successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to unequip item', 500);
    }
  };

  /**
   * Get equipped items
   * GET /api/v1/shop/equipped
   */
  getEquippedItems = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const equipped = await shopService.getEquippedItems(userId);
      const result = Object.fromEntries(equipped);
      return sendSuccess(res, result, 'Equipped items retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get equipped items',
        500
      );
    }
  };
}

// Export singleton instance
export const shopController = new ShopController();
