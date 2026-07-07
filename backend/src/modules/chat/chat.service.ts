/**
 * Chat - Service Layer
 * CV-MOD-005
 *
 * Implements business logic for private messaging between friends including
 * sending messages, retrieving chat history, and managing read status.
 */

import { presenceService } from '../presence/presence.service';

import {
  Message,
  MessageStatus,
  ChatRoom,
  SendMessageRequest,
  MessageResponse,
  ChatRoomResponse,
  GetMessagesResponse,
} from './chat.types';

// In-memory stores (will be replaced with Redis/PostgreSQL in production)
const messages = new Map<string, Message[]>(); // userId -> messages[]
const chatRooms = new Map<string, ChatRoom>(); // roomId -> ChatRoom
const unreadCounts = new Map<string, Map<string, number>>(); // userId -> (friendId -> count)

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper to get chat room ID for two users
function getChatRoomId(user1Id: string, user2Id: string): string {
  return [user1Id, user2Id].sort().join('_');
}

export class ChatService {
  /**
   * Send a message from one user to another
   */
  async sendMessage(senderId: string, request: SendMessageRequest): Promise<MessageResponse> {
    const { receiverId, content } = request;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (content.length > 5000) {
      throw new Error('Message content exceeds maximum length (5000 characters)');
    }

    // Create message
    const message: Message = {
      id: generateId(),
      senderId,
      receiverId,
      content: content.trim(),
      status: MessageStatus.SENT,
      createdAt: new Date(),
    };

    // Store message for both users
    const senderMessages = messages.get(senderId) || [];
    senderMessages.push(message);
    messages.set(senderId, senderMessages);

    const receiverMessages = messages.get(receiverId) || [];
    receiverMessages.push(message);
    messages.set(receiverId, receiverMessages);

    // Update chat room
    const roomId = getChatRoomId(senderId, receiverId);
    let room = chatRooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        user1Id: senderId,
        user2Id: receiverId,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    room.lastMessage = message;
    room.lastMessageAt = new Date();
    room.updatedAt = new Date();
    chatRooms.set(roomId, room);

    // Increment unread count for receiver
    const receiverUnread = unreadCounts.get(receiverId) || new Map<string, number>();
    const currentCount = receiverUnread.get(senderId) || 0;
    receiverUnread.set(senderId, currentCount + 1);
    unreadCounts.set(receiverId, receiverUnread);

    return this.toMessageResponse(message, senderId);
  }

  /**
   * Get messages between two users with pagination
   */
  async getMessages(
    userId: string,
    friendId: string,
    limit: number = 50,
    before?: Date
  ): Promise<GetMessagesResponse> {
    const userMessages = messages.get(userId) || [];

    // Filter messages between these two users
    let filtered = userMessages.filter(
      (m) =>
        (m.senderId === userId && m.receiverId === friendId) ||
        (m.senderId === friendId && m.receiverId === userId)
    );

    // Filter by date if provided
    if (before) {
      filtered = filtered.filter((m) => m.createdAt < before);
    }

    // Sort by date descending (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const total = filtered.length;
    const paginated = filtered.slice(0, limit);
    const hasMore = paginated.length < total;

    // Mark messages as read if userId is receiver
    const unreadMessages = paginated.filter(
      (m) => m.receiverId === userId && m.status !== MessageStatus.READ
    );
    if (unreadMessages.length > 0) {
      for (const m of unreadMessages) {
        m.status = MessageStatus.READ;
        m.readAt = new Date();
      }
      // Update unread counts
      const userUnread = unreadCounts.get(userId) || new Map<string, number>();
      userUnread.delete(friendId);
      unreadCounts.set(userId, userUnread);
    }

    return {
      messages: paginated.map((m) => this.toMessageResponse(m, userId)),
      hasMore,
      total,
    };
  }

  /**
   * Get all chat rooms for a user
   */
  async getChatRooms(userId: string): Promise<ChatRoomResponse[]> {
    const rooms: ChatRoomResponse[] = [];
    const allRooms = Array.from(chatRooms.values());

    for (const room of allRooms) {
      const friendId = room.user1Id === userId ? room.user2Id : room.user1Id;
      if (room.user1Id === userId || room.user2Id === userId) {
        // Get unread count
        const userUnread = unreadCounts.get(userId) || new Map<string, number>();
        const unreadCount = userUnread.get(friendId) || 0;

        // Get last message
        const userMessages = messages.get(userId) || [];
        const lastMsg = userMessages
          .filter(
            (m) =>
              (m.senderId === userId && m.receiverId === friendId) ||
              (m.senderId === friendId && m.receiverId === userId)
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        // Get friend presence status
        const presence = await presenceService.getPresence(friendId);

        // TODO: Get friend username and avatar from UserService (will be added later)

        rooms.push({
          id: room.id,
          userId,
          friendId,
          friendUsername: `User ${friendId.substring(0, 8)}`, // Placeholder
          friendAvatar: undefined,
          friendStatus: presence ? presence.status : 'offline',
          lastMessage: lastMsg
            ? {
                content: lastMsg.content,
                createdAt: lastMsg.createdAt,
                isMine: lastMsg.senderId === userId,
              }
            : undefined,
          unreadCount,
          lastMessageAt: room.lastMessageAt,
        });
      }
    }

    // Sort by last message date (newest first)
    rooms.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

    return rooms;
  }

  /**
   * Get total unread count for a user
   */
  async getUnreadCount(userId: string): Promise<{ total: number; byFriend: Map<string, number> }> {
    const userUnread = unreadCounts.get(userId) || new Map<string, number>();
    let total = 0;
    for (const count of userUnread.values()) {
      total += count;
    }
    return {
      total,
      byFriend: userUnread,
    };
  }

  /**
   * Mark messages as read for a specific friend
   */
  async markAsRead(userId: string, friendId: string): Promise<void> {
    const userUnread = unreadCounts.get(userId) || new Map<string, number>();
    userUnread.delete(friendId);
    unreadCounts.set(userId, userUnread);

    // Update message status
    const userMessages = messages.get(userId) || [];
    for (const m of userMessages) {
      if (m.senderId === friendId && m.receiverId === userId && m.status !== MessageStatus.READ) {
        m.status = MessageStatus.READ;
        m.readAt = new Date();
      }
    }
    messages.set(userId, userMessages);
  }

  /**
   * Delete a message (soft delete - mark as deleted)
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const userMessages = messages.get(userId) || [];
    const index = userMessages.findIndex((m) => m.id === messageId);
    if (index !== -1 && userMessages[index].senderId === userId) {
      // In a real implementation, we would soft delete
      // For now, just remove it
      userMessages.splice(index, 1);
      messages.set(userId, userMessages);
    }
  }

  /**
   * Convert Message to MessageResponse
   */
  private toMessageResponse(message: Message, currentUserId: string): MessageResponse {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      status: message.status,
      createdAt: message.createdAt,
      isMine: message.senderId === currentUserId,
    };
  }
}

// Export singleton instance
export const chatService = new ChatService();
