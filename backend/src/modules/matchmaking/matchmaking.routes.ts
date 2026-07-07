/**
 * Matchmaking - Routes Layer
 * CV-MOD-007
 *
 * Defines API routes for matchmaking including joining queue,
 * leaving queue, getting queue status, and matchmaking statistics.
 */

import { Router } from 'express';

import { matchmakingController } from './matchmaking.controller';

const router = Router();

/**
 * @route   POST /api/v1/matchmaking/queue
 * @desc    Join the matchmaking queue
 * @access  Private
 */
router.post('/queue', matchmakingController.joinQueue);

/**
 * @route   DELETE /api/v1/matchmaking/queue
 * @desc    Leave the matchmaking queue
 * @access  Private
 */
router.delete('/queue', matchmakingController.leaveQueue);

/**
 * @route   GET /api/v1/matchmaking/queue/status
 * @desc    Get queue status for current user
 * @access  Private
 */
router.get('/queue/status', matchmakingController.getQueueStatus);

/**
 * @route   POST /api/v1/matchmaking/find
 * @desc    Find a match (trigger matchmaking)
 * @access  Private
 */
router.post('/find', matchmakingController.findMatch);

/**
 * @route   GET /api/v1/matchmaking/stats
 * @desc    Get matchmaking statistics
 * @access  Private
 */
router.get('/stats', matchmakingController.getStats);

/**
 * @route   GET /api/v1/matchmaking/matches/:matchId
 * @desc    Get a specific match by ID
 * @access  Private
 */
router.get('/matches/:matchId', matchmakingController.getMatch);

export default router;
