/**
 * Shop - Routes Layer
 * CV-MOD-009
 *
 * Defines API routes for shop system including browsing items,
 * purchasing items, and managing user inventory.
 */

import { Router } from 'express';

import { shopController } from './shop.controller';

const router: Router = Router();

/**
 * @route   GET /api/v1/shop/items
 * @desc    Get all shop items with filtering and pagination
 * @access  Private
 */
router.get('/items', shopController.getShopItems);

/**
 * @route   GET /api/v1/shop/items/:itemId
 * @desc    Get a specific shop item by ID
 * @access  Private
 */
router.get('/items/:itemId', shopController.getShopItem);

/**
 * @route   POST /api/v1/shop/purchase
 * @desc    Purchase an item from the shop
 * @access  Private
 */
router.post('/purchase', shopController.purchaseItem);

/**
 * @route   GET /api/v1/shop/inventory
 * @desc    Get user inventory
 * @access  Private
 */
router.get('/inventory', shopController.getInventory);

/**
 * @route   POST /api/v1/shop/equip
 * @desc    Equip an item
 * @access  Private
 */
router.post('/equip', shopController.equipItem);

/**
 * @route   POST /api/v1/shop/unequip
 * @desc    Unequip an item
 * @access  Private
 */
router.post('/unequip', shopController.unequipItem);

/**
 * @route   GET /api/v1/shop/equipped
 * @desc    Get equipped items
 * @access  Private
 */
router.get('/equipped', shopController.getEquippedItems);

export default router;
