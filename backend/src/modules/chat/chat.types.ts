/**
 * Chat - Type Definitions
 * CV-MOD-005
 *
 * Defines types and interfaces for private messaging between friends
 * including messages, chat rooms, and message status.
 */

/* eslint-disable no-unused-vars */
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}
/* eslint-enable no-unused-vars */

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}

export interface ChatRoom {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: Message;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  isMine: boolean;
}

export interface ChatRoomResponse {
  id: string;
  userId: string;
  friendId: string;
  friendUsername: string;
  friendAvatar?: string;
  friendStatus: string;
  lastMessage?: {
    content: string;
    createdAt: Date;
    isMine: boolean;
  };
  unreadCount: number;
  lastMessageAt: Date;
}

export interface GetMessagesRequest {
  friendId: string;
  limit?: number;
  before?: Date;
}

export interface GetMessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  total: number;
}

export interface UnreadCountResponse {
  totalUnread: number;
  friendUnread?: {
    friendId: string;
    count: number;
  }[];
}

export interface MarkAsReadRequest {
  friendId: string;
  messageIds?: string[];
}
