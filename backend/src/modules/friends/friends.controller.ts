// Friends Controller - Route Handlers
// Based on API.md Section 4 - Endpoint Standards

import { Request, Response } from 'express';

import { ResponseHelper } from '../../utils/response.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

import { FriendsService } from './friends.service.js';

const friendsService = new FriendsService();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export class FriendsController {
  // POST /api/v1/friends/requests - Send friend request
  sendRequest = asyncHandler(async (req: Request, res: Response) => {
    const { toUserId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const result = await friendsService.sendRequest(userId, toUserId);
    res.status(201).json(ResponseHelper.success(result, 'Friend request sent'));
  });

  // PUT /api/v1/friends/requests/:id/accept - Accept friend request
  acceptRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const result = await friendsService.acceptRequest(id, userId);
    res.json(ResponseHelper.success(result, 'Friend request accepted'));
  });

  // DELETE /api/v1/friends/requests/:id/reject - Reject friend request
  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    await friendsService.rejectRequest(id, userId);
    res.json(ResponseHelper.success(null, 'Friend request rejected'));
  });

  // DELETE /api/v1/friends/requests/:id/cancel - Cancel friend request
  cancelRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    await friendsService.cancelRequest(id, userId);
    res.json(ResponseHelper.success(null, 'Friend request cancelled'));
  });

  // GET /api/v1/friends - Get friends list
  getFriends = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const friends = await friendsService.getFriends(userId);
    res.json(ResponseHelper.success(friends));
  });

  // DELETE /api/v1/friends/:id - Remove friend
  removeFriend = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    await friendsService.removeFriend(userId, id);
    res.json(ResponseHelper.success(null, 'Friend removed'));
  });

  // GET /api/v1/friends/requests/incoming - Get incoming requests
  getIncomingRequests = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const requests = await friendsService.getIncomingRequests(userId);
    res.json(ResponseHelper.success(requests));
  });

  // GET /api/v1/friends/requests/outgoing - Get outgoing requests
  getOutgoingRequests = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const requests = await friendsService.getOutgoingRequests(userId);
    res.json(ResponseHelper.success(requests));
  });

  // GET /api/v1/friends/search - Search players
  searchPlayers = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ResponseHelper.error('Unauthorized', 'UNAUTHORIZED'));
    }
    const results = await friendsService.searchPlayers(q as string, userId);
    res.json(ResponseHelper.success(results));
  });
}
