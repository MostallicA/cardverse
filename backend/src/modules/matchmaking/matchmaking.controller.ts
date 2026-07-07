/**
 * Matchmaking - Controller Layer
 * CV-MOD-007
 *
 * Handles HTTP requests for matchmaking including joining queue,
 * leaving queue, getting queue status, and matchmaking statistics.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { matchmakingService } from './matchmaking.service';
import { validateJoinQueue, validateMatchId } from './matchmaking.validator';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class MatchmakingController {
  /**
   * Join the matchmaking queue
   * POST /api/v1/matchmaking/queue
   */
  joinQueue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateJoinQueue(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const status = await matchmakingService.joinQueue(userId, req.body);
    return successResponse(res, status, 'Joined matchmaking queue successfully');
  });

  /**
   * Leave the matchmaking queue
   * DELETE /api/v1/matchmaking/queue
   */
  leaveQueue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    await matchmakingService.leaveQueue(userId);
    return successResponse(res, null, 'Left matchmaking queue successfully');
  });

  /**
   * Get queue status for current user
   * GET /api/v1/matchmaking/queue/status
   */
  getQueueStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const status = await matchmakingService.getQueueStatus(userId);
    return successResponse(res, status, 'Queue status retrieved successfully');
  });

  /**
   * Find a match (trigger matchmaking)
   * POST /api/v1/matchmaking/find
   */
  findMatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const match = await matchmakingService.findMatch(userId);
    if (!match) {
      return successResponse(res, null, 'No match found yet, still searching');
    }

    return successResponse(res, match, 'Match found successfully');
  });

  /**
   * Get matchmaking statistics
   * GET /api/v1/matchmaking/stats
   */
  getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Allow access to authenticated users (admin in future)
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const stats = await matchmakingService.getStats();
    return successResponse(res, stats, 'Matchmaking statistics retrieved successfully');
  });

  /**
   * Get a specific match by ID
   * GET /api/v1/matchmaking/matches/:matchId
   */
  getMatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { matchId } = req.params;

    // Validate matchId
    const validation = validateMatchId(matchId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const match = await matchmakingService.getMatch(matchId);
    if (!match) {
      return errorResponse(res, 'Match not found', 404);
    }

    return successResponse(res, match, 'Match retrieved successfully');
  });
}

// Export singleton instance
export const matchmakingController = new MatchmakingController();
