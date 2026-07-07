/**
 * Chat - Controller Layer
 * CV-MOD-005
 *
 * Handles HTTP requests for private messaging including sending messages,
 * retrieving chat history, managing chat rooms, and marking messages as read.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { chatService } from './chat.service';
import {
  validateSendMessage,
  validateFriendId,
  validateMessageId,
  validateMarkAsRead,
} from './chat.validator';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class ChatController {
  /**
   * Send a message to a friend
   * POST /api/v1/chat/messages
   */
  sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateSendMessage(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const message = await chatService.sendMessage(userId, req.body);
    return successResponse(res, message, 'Message sent successfully');
  });

  /**
   * Get messages between current user and a friend
   * GET /api/v1/chat/messages/:friendId
   */
  getMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { friendId } = req.params;
    const { limit, before } = req.query;

    // Validate friendId
    const validation = validateFriendId(friendId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    // Parse limit
    let parsedLimit = 50;
    if (limit) {
      parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        parsedLimit = 50;
      }
      if (parsedLimit > 100) {
        parsedLimit = 100;
      }
    }

    // Parse before date
    let beforeDate: Date | undefined;
    if (before) {
      beforeDate = new Date(before as string);
      if (isNaN(beforeDate.getTime())) {
        beforeDate = undefined;
      }
    }

    const result = await chatService.getMessages(userId, friendId, parsedLimit, beforeDate);
    return successResponse(res, result, 'Messages retrieved successfully');
  });

  /**
   * Get all chat rooms for current user
   * GET /api/v1/chat/rooms
   */
  getChatRooms = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const rooms = await chatService.getChatRooms(userId);
    return successResponse(res, { rooms }, 'Chat rooms retrieved successfully');
  });

  /**
   * Get unread message count
   * GET /api/v1/chat/unread
   */
  getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const unread = await chatService.getUnreadCount(userId);
    return successResponse(
      res,
      {
        total: unread.total,
        byFriend: Object.fromEntries(unread.byFriend),
      },
      'Unread count retrieved successfully'
    );
  });

  /**
   * Mark messages as read for a specific friend
   * POST /api/v1/chat/read
   */
  markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateMarkAsRead(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await chatService.markAsRead(userId, req.body.friendId);
    return successResponse(res, null, 'Messages marked as read successfully');
  });

  /**
   * Delete a message
   * DELETE /api/v1/chat/messages/:messageId
   */
  deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { messageId } = req.params;

    // Validate messageId
    const validation = validateMessageId(messageId);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    await chatService.deleteMessage(userId, messageId);
    return successResponse(res, null, 'Message deleted successfully');
  });
}

// Export singleton instance
export const chatController = new ChatController();
