/**
 * Friends Service - Business Logic
 * Based on PRODUCT_BIBLE.md Section 4.1 - Friends System
 */

import { Friend, FriendRequest } from './friends.types.js';

// In-memory storage (will be replaced with database)
const friends: Friend[] = [];
const friendRequests: FriendRequest[] = [];

export class FriendsService {
  // Send friend request
  async sendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    // Check if already friends
    const existingFriend = friends.find(
      (f) =>
        (f.userId === fromUserId && f.friendId === toUserId) ||
        (f.userId === toUserId && f.friendId === fromUserId)
    );
    if (existingFriend && existingFriend.status === 'accepted') {
      throw new Error('Already friends');
    }

    // Check if request already exists
    const existingRequest = friendRequests.find(
      (r) =>
        (r.fromUserId === fromUserId && r.toUserId === toUserId) ||
        (r.fromUserId === toUserId && r.toUserId === fromUserId)
    );
    if (existingRequest && existingRequest.status === 'pending') {
      throw new Error('Friend request already pending');
    }

    // Create new friend request
    const request: FriendRequest = {
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    friendRequests.push(request);
    return request;
  }

  // Accept friend request
  async acceptRequest(requestId: string, userId: string): Promise<Friend> {
    const requestIndex = friendRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error('Friend request not found');
    }

    const request = friendRequests[requestIndex];
    if (request.toUserId !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    // Create friendship
    const friendship: Friend = {
      id: crypto.randomUUID(),
      userId: request.fromUserId,
      friendId: request.toUserId,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    friends.push(friendship);

    // Also create reverse friendship
    const reverseFriendship: Friend = {
      id: crypto.randomUUID(),
      userId: request.toUserId,
      friendId: request.fromUserId,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    friends.push(reverseFriendship);

    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();

    return friendship;
  }

  // Reject friend request
  async rejectRequest(requestId: string, userId: string): Promise<void> {
    const request = friendRequests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.toUserId !== userId) {
      throw new Error('Not authorized to reject this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    request.status = 'rejected';
    request.updatedAt = new Date();
  }

  // Cancel friend request
  async cancelRequest(requestId: string, userId: string): Promise<void> {
    const request = friendRequests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.fromUserId !== userId) {
      throw new Error('Not authorized to cancel this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    request.status = 'cancelled';
    request.updatedAt = new Date();
  }

  // Get friends list
  async getFriends(userId: string): Promise<Friend[]> {
    return friends.filter((f) => f.userId === userId && f.status === 'accepted');
  }

  // Remove friend
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const index = friends.findIndex(
      (f) => f.userId === userId && f.friendId === friendId && f.status === 'accepted'
    );
    if (index === -1) {
      throw new Error('Friend not found');
    }

    // Remove both directions
    const reverseIndex = friends.findIndex(
      (f) => f.userId === friendId && f.friendId === userId && f.status === 'accepted'
    );
    if (reverseIndex !== -1) {
      friends.splice(reverseIndex, 1);
    }
    friends.splice(index, 1);
  }

  // Get incoming friend requests
  async getIncomingRequests(userId: string): Promise<FriendRequest[]> {
    return friendRequests.filter((r) => r.toUserId === userId && r.status === 'pending');
  }

  // Get outgoing friend requests
  async getOutgoingRequests(userId: string): Promise<FriendRequest[]> {
    return friendRequests.filter((r) => r.fromUserId === userId && r.status === 'pending');
  }

  /**
   * Search players by username (for friend request)
   * This is a placeholder - will be implemented when UserService is ready
   * Returns empty array for now
   */
  async searchPlayers(): Promise<
    Array<{ id: string; username: string; avatar?: string; isFriend: boolean }>
  > {
    // TODO: Implement search using UserService
    // This will query the User module to find players by username
    return [];
  }
}
