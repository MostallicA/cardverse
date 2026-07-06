// Friends System Types
// Based on PRODUCT_BIBLE.md Section 4.1 - Friends System
// and DATABASE.md Section 4.3 - Friend Entity

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SendFriendRequest {
  toUserId: string;
}

export interface FriendResponse {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  status: string;
  createdAt: Date;
}

export interface FriendRequestResponse {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar: string;
  status: string;
  createdAt: Date;
}
