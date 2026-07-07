/**
 * Chat - Routes Layer
 * CV-MOD-005
 *
 * Defines API routes for private messaging including sending messages,
 * retrieving chat history, managing chat rooms, and marking messages as read.
 */

import { Router } from 'express';

import { chatController } from './chat.controller';

const router = Router();

/**
 * @route   POST /api/v1/chat/messages
 * @desc    Send a message to a friend
 * @access  Private
 */
router.post('/messages', chatController.sendMessage);

/**
 * @route   GET /api/v1/chat/messages/:friendId
 * @desc    Get messages between current user and a friend
 * @access  Private
 */
router.get('/messages/:friendId', chatController.getMessages);

/**
 * @route   DELETE /api/v1/chat/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/messages/:messageId', chatController.deleteMessage);

/**
 * @route   GET /api/v1/chat/rooms
 * @desc    Get all chat rooms for current user
 * @access  Private
 */
router.get('/rooms', chatController.getChatRooms);

/**
 * @route   GET /api/v1/chat/unread
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread', chatController.getUnreadCount);

/**
 * @route   POST /api/v1/chat/read
 * @desc    Mark messages as read for a specific friend
 * @access  Private
 */
router.post('/read', chatController.markAsRead);

export default router;
