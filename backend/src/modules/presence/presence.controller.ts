/**
 * Presence - Controller Layer
 * CV-MOD-004
 *
 * Handles HTTP requests for presence management including status updates,
 * presence queries, heartbeat, and presence statistics.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { presenceService } from './presence.service';
import {
  validatePresenceUpdate,
  validateHeartbeat,
  validateBatchQuery,
  validateUserId,
} from './presence.validator';

export class PresenceController {
  /**
   * Update user presence status
   * POST /api/v1/presence
   */
  updatePresence = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validatePresenceUpdate(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const presence = await presenceService.updatePresence(userId, req.body);
    return successResponse(res, presence, 'Presence updated successfully');
  });

  /**
   * Get current user presence
   * GET /api/v1/presence/me
   */
  getMyPresence = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const presence = await presenceService.getPresence(userId);
    if (!presence) {
      return errorResponse(res, 'Presence not found', 404);
    }

    return successResponse(res, presence, 'Presence retrieved successfully');
  });

  /**
   * Get presence by user ID
   * GET /api/v1/presence/:userId
   */
  getPresence = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Validate userId
    const validation = validateUserId(userId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const presence = await presenceService.getPresence(userId);
    if (!presence) {
      return errorResponse(res, 'Presence not found', 404);
    }

    return successResponse(res, presence, 'Presence retrieved successfully');
  });

  /**
   * Get presence for multiple users (batch)
   * POST /api/v1/presence/batch
   */
  getBatchPresence = asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const validation = validateBatchQuery(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const presences = await presenceService.getPresenceBatch(req.body.userIds);
    return successResponse(res, { presences }, 'Presences retrieved successfully');
  });

  /**
   * Send heartbeat to keep presence alive
   * POST /api/v1/presence/heartbeat
   */
  heartbeat = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateHeartbeat(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await presenceService.heartbeat(userId, req.body.sessionId);
    return successResponse(res, null, 'Heartbeat sent successfully');
  });

  /**
   * Get presence statistics
   * GET /api/v1/presence/stats
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await presenceService.getStats();
    return successResponse(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Set user as online (login)
   * POST /api/v1/presence/online
   */
  setOnline = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { sessionId, deviceInfo } = req.body;
    if (!sessionId) {
      return errorResponse(res, 'sessionId is required', 400);
    }

    const presence = await presenceService.setOnline(userId, sessionId, deviceInfo);
    return successResponse(res, presence, 'User set to online');
  });

  /**
   * Set user as offline (logout)
   * POST /api/v1/presence/offline
   */
  setOffline = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    await presenceService.setOffline(userId);
    return successResponse(res, null, 'User set to offline');
  });
}

// Export singleton instance
export const presenceController = new PresenceController();
