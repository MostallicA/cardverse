/**
 * Presence - Routes Layer
 * CV-MOD-004
 *
 * Defines API routes for presence management including status updates,
 * presence queries, heartbeat, and presence statistics.
 */

import { Router } from 'express';

import { presenceController } from './presence.controller.js';

const router: Router = Router();

/**
 * @route   POST /api/v1/presence
 * @desc    Update user presence status
 * @access  Private
 */
router.post('/', presenceController.updatePresence);

/**
 * @route   GET /api/v1/presence/me
 * @desc    Get current user presence
 * @access  Private
 */
router.get('/me', presenceController.getMyPresence);

/**
 * @route   GET /api/v1/presence/:userId
 * @desc    Get presence by user ID
 * @access  Private
 */
router.get('/:userId', presenceController.getPresence);

/**
 * @route   POST /api/v1/presence/batch
 * @desc    Get presence for multiple users
 * @access  Private
 */
router.post('/batch', presenceController.getBatchPresence);

/**
 * @route   POST /api/v1/presence/heartbeat
 * @desc    Send heartbeat to keep presence alive
 * @access  Private
 */
router.post('/heartbeat', presenceController.heartbeat);

/**
 * @route   GET /api/v1/presence/stats
 * @desc    Get presence statistics
 * @access  Private (Admin only in future)
 */
router.get('/stats', presenceController.getStats);

/**
 * @route   POST /api/v1/presence/online
 * @desc    Set user as online (login)
 * @access  Private
 */
router.post('/online', presenceController.setOnline);

/**
 * @route   POST /api/v1/presence/offline
 * @desc    Set user as offline (logout)
 * @access  Private
 */
router.post('/offline', presenceController.setOffline);

export default router;
