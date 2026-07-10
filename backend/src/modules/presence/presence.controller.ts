/**
 * Presence - Controller Layer
 * CV-MOD-004
 *
 * Handles HTTP requests for presence management including status updates,
 * presence queries, heartbeat, and presence statistics.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils';

import { presenceService } from './presence.service';
import {
  validatePresenceUpdate,
  validateHeartbeat,
  validateBatchQuery,
} from './presence.validator';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class PresenceController {
  /**
   * Update user presence status
   * POST /api/v1/presence
   */
  updatePresence = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validatePresenceUpdate(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const presence = await presenceService.updatePresence(userId, req.body);
      return sendSuccess(res, presence, 'Presence updated successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to update presence',
        500
      );
    }
  };

  /**
   * Get current user presence
   * GET /api/v1/presence/me
   */
  getMyPresence = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const presence = await presenceService.getPresence(userId);
      if (!presence) {
        return sendError(res, 'Presence not found', 404);
      }

      return sendSuccess(res, presence, 'Presence retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get presence', 500);
    }
  };

  /**
   * Get presence by user ID
   * GET /api/v1/presence/:userId
   */
  getPresence = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = getRequiredParamString(req.params.userId, 'userId');

      const presence = await presenceService.getPresence(userId);
      if (!presence) {
        return sendError(res, 'Presence not found', 404);
      }

      return sendSuccess(res, presence, 'Presence retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get presence', 500);
    }
  };

  /**
   * Get presence for multiple users (batch)
   * POST /api/v1/presence/batch
   */
  getBatchPresence = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      // Validate request
      const validation = validateBatchQuery(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const presences = await presenceService.getPresenceBatch(req.body.userIds);
      return sendSuccess(res, { presences }, 'Presences retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get batch presence',
        500
      );
    }
  };

  /**
   * Send heartbeat to keep presence alive
   * POST /api/v1/presence/heartbeat
   */
  heartbeat = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateHeartbeat(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      await presenceService.heartbeat(userId, req.body.sessionId);
      return sendSuccess(res, null, 'Heartbeat sent successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to send heartbeat',
        500
      );
    }
  };

  /**
   * Get presence statistics
   * GET /api/v1/presence/stats
   */
  getStats = async (_req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const stats = await presenceService.getStats();
      return sendSuccess(res, stats, 'Statistics retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get statistics',
        500
      );
    }
  };

  /**
   * Set user as online (login)
   * POST /api/v1/presence/online
   */
  setOnline = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { sessionId, deviceInfo } = req.body;
      if (!sessionId) {
        return sendError(res, 'sessionId is required', 400);
      }

      const presence = await presenceService.setOnline(userId, sessionId, deviceInfo);
      return sendSuccess(res, presence, 'User set to online');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to set online', 500);
    }
  };

  /**
   * Set user as offline (logout)
   * POST /api/v1/presence/offline
   */
  setOffline = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      await presenceService.setOffline(userId);
      return sendSuccess(res, null, 'User set to offline');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to set offline', 500);
    }
  };
}

// Export singleton instance
export const presenceController = new PresenceController();
