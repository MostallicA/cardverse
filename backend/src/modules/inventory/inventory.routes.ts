/**
 * Inventory - Routes Layer
 * CV-MOD-010
 *
 * Defines API routes for inventory management including viewing items,
 * using items, and transferring items.
 */

import { Router } from 'express';

import { inventoryController } from './inventory.controller.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/inventory
 * @desc    Get inventory items for current user
 * @access  Private
 */
router.get('/', inventoryController.getInventory);

/**
 * @route   GET /api/v1/inventory/:itemId
 * @desc    Get a specific inventory item
 * @access  Private
 */
router.get('/:itemId', inventoryController.getInventoryItem);

/**
 * @route   POST /api/v1/inventory/use
 * @desc    Use an item from inventory
 * @access  Private
 */
router.post('/use', inventoryController.useItem);

/**
 * @route   POST /api/v1/inventory/transfer
 * @desc    Transfer an item to another user
 * @access  Private
 */
router.post('/transfer', inventoryController.transferItem);

/**
 * @route   GET /api/v1/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private
 */
router.get('/stats', inventoryController.getStats);

/**
 * @route   GET /api/v1/inventory/equipped
 * @desc    Get equipped items
 * @access  Private
 */
router.get('/equipped', inventoryController.getEquippedItems);

/**
 * @route   POST /api/v1/inventory/equip
 * @desc    Equip an item
 * @access  Private
 */
router.post('/equip', inventoryController.equipItem);

/**
 * @route   POST /api/v1/inventory/unequip
 * @desc    Unequip an item
 * @access  Private
 */
router.post('/unequip', inventoryController.unequipItem);

export default router;
