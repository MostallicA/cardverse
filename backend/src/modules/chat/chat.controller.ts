/**
 * Chat - Controller Layer
 * CV-MOD-005
 *
 * Handles HTTP requests for chat functionality including private messaging,
 * chat rooms, unread counts, and message management.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError, getRequiredParamString } from '../../utils/controller.utils.js';

import { chatService } from './chat.service.js';

export class ChatController {
  /**
   * Send a message to a friend
   * POST /api/v1/chat/messages
   */
  sendMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { friendId, content } = req.body;
      if (!friendId || !content) {
        return sendError(res, 'friendId and content are required', 400);
      }

      const message = await chatService.sendMessage(userId, {
        receiverId: friendId,
        content,
      });
      return sendSuccess(res, message, 'Message sent successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to send message', 500);
    }
  };

  /**
   * Get messages with a friend
   * GET /api/v1/chat/messages/:friendId
   */
  getMessages = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const friendId = getRequiredParamString(req.params.friendId, 'friendId');
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const before = req.query.before ? new Date(req.query.before as string) : undefined;

      const result = await chatService.getMessages(userId, friendId, limit, before);
      return sendSuccess(res, result, 'Messages retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get messages', 500);
    }
  };

  /**
   * Get chat rooms for the current user
   * GET /api/v1/chat/rooms
   */
  getRooms = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const rooms = await chatService.getChatRooms(userId);
      return sendSuccess(res, { rooms }, 'Chat rooms retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get rooms', 500);
    }
  };

  /**
   * Get unread message count
   * GET /api/v1/chat/unread
   */
  getUnreadCount = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const unread = await chatService.getUnreadCount(userId);
      return sendSuccess(res, unread, 'Unread count retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get unread count',
        500
      );
    }
  };

  /**
   * Mark messages as read
   * POST /api/v1/chat/read
   */
  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { friendId } = req.body;
      if (!friendId) {
        return sendError(res, 'friendId is required', 400);
      }

      await chatService.markAsRead(userId, friendId);
      return sendSuccess(res, null, 'Messages marked as read successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to mark as read', 500);
    }
  };

  /**
   * Delete a message
   * DELETE /api/v1/chat/messages/:messageId
   */
  deleteMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const messageId = getRequiredParamString(req.params.messageId, 'messageId');
      await chatService.deleteMessage(userId, messageId);
      return sendSuccess(res, null, 'Message deleted successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to delete message',
        500
      );
    }
  };
}

// Export singleton instance
export const chatController = new ChatController();
