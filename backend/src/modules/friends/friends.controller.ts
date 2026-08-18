/**
 * Friends Controller - Route Handlers
 * Based on API.md Section 4 - Endpoint Standards
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils.js';

import { FriendsService } from './friends.service.js';

const friendsService = new FriendsService();

export class FriendsController {
  /**
   * POST /api/v1/friends/requests - Send friend request
   */
  sendRequest = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { toUserId } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      if (!toUserId) {
        return sendError(res, 'toUserId is required', 400);
      }
      const result = await friendsService.sendRequest(userId, toUserId);
      return sendSuccess(res, result, 'Friend request sent');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to send friend request',
        500
      );
    }
  };

  /**
   * PUT /api/v1/friends/requests/:id/accept - Accept friend request
   */
  acceptRequest = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = getRequiredParamString(req.params.id, 'id');
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      const result = await friendsService.acceptRequest(id, userId);
      return sendSuccess(res, result, 'Friend request accepted');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to accept friend request',
        500
      );
    }
  };

  /**
   * DELETE /api/v1/friends/requests/:id/reject - Reject friend request
   */
  rejectRequest = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = getRequiredParamString(req.params.id, 'id');
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      await friendsService.rejectRequest(id, userId);
      return sendSuccess(res, null, 'Friend request rejected');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to reject friend request',
        500
      );
    }
  };

  /**
   * DELETE /api/v1/friends/requests/:id/cancel - Cancel friend request
   */
  cancelRequest = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = getRequiredParamString(req.params.id, 'id');
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      await friendsService.cancelRequest(id, userId);
      return sendSuccess(res, null, 'Friend request cancelled');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to cancel friend request',
        500
      );
    }
  };

  /**
   * GET /api/v1/friends - Get friends list
   */
  getFriends = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      const friends = await friendsService.getFriends(userId);
      return sendSuccess(res, friends);
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get friends', 500);
    }
  };

  /**
   * DELETE /api/v1/friends/:id - Remove friend
   */
  removeFriend = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = getRequiredParamString(req.params.id, 'id');
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      await friendsService.removeFriend(userId, id);
      return sendSuccess(res, null, 'Friend removed');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to remove friend',
        500
      );
    }
  };

  /**
   * GET /api/v1/friends/requests/incoming - Get incoming requests
   */
  getIncomingRequests = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      const requests = await friendsService.getIncomingRequests(userId);
      return sendSuccess(res, requests);
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get incoming requests',
        500
      );
    }
  };

  /**
   * GET /api/v1/friends/requests/outgoing - Get outgoing requests
   */
  getOutgoingRequests = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      const requests = await friendsService.getOutgoingRequests(userId);
      return sendSuccess(res, requests);
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get outgoing requests',
        500
      );
    }
  };

  /**
   * GET /api/v1/friends/search - Search players
   */
  searchPlayers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { query } = req.query;
      const searchQuery = typeof query === 'string' ? query : '';

      // searchPlayers now takes userId and query
      const results = await friendsService.searchPlayers(userId, searchQuery);

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search players',
      });
    }
  };
}
