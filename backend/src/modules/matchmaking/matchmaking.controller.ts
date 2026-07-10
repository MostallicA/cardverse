/**
 * Matchmaking - Controller Layer
 * CV-MOD-007
 *
 * Handles HTTP requests for matchmaking including joining queue,
 * leaving queue, getting queue status, and matchmaking statistics.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils';

import { matchmakingService } from './matchmaking.service';
import { validateJoinQueue } from './matchmaking.validator';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class MatchmakingController {
  /**
   * Join the matchmaking queue
   * POST /api/v1/matchmaking/queue
   */
  joinQueue = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateJoinQueue(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const status = await matchmakingService.joinQueue(userId, req.body);
      return sendSuccess(res, status, 'Joined matchmaking queue successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to join queue', 500);
    }
  };

  /**
   * Leave the matchmaking queue
   * DELETE /api/v1/matchmaking/queue
   */
  leaveQueue = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      await matchmakingService.leaveQueue(userId);
      return sendSuccess(res, null, 'Left matchmaking queue successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to leave queue', 500);
    }
  };

  /**
   * Get queue status for current user
   * GET /api/v1/matchmaking/queue/status
   */
  getQueueStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const status = await matchmakingService.getQueueStatus(userId);
      return sendSuccess(res, status, 'Queue status retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get queue status',
        500
      );
    }
  };

  /**
   * Find a match (trigger matchmaking)
   * POST /api/v1/matchmaking/find
   */
  findMatch = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const match = await matchmakingService.findMatch(userId);
      if (!match) {
        return sendSuccess(res, null, 'No match found yet, still searching');
      }

      return sendSuccess(res, match, 'Match found successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to find match', 500);
    }
  };

  /**
   * Get matchmaking statistics
   * GET /api/v1/matchmaking/stats
   */
  getStats = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const stats = await matchmakingService.getStats();
      return sendSuccess(res, stats, 'Matchmaking statistics retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get statistics',
        500
      );
    }
  };

  /**
   * Get a specific match by ID
   * GET /api/v1/matchmaking/matches/:matchId
   */
  getMatch = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const matchId = getRequiredParamString(req.params.matchId, 'matchId');

      const match = await matchmakingService.getMatch(matchId);
      if (!match) {
        return sendError(res, 'Match not found', 404);
      }

      return sendSuccess(res, match, 'Match retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get match', 500);
    }
  };
}

// Export singleton instance
export const matchmakingController = new MatchmakingController();
