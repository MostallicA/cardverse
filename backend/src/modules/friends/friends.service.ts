/**
 * Friends Service - Business Logic
 * Based on PRODUCT_BIBLE.md Section 4.1 - Friends System
 * Now uses Prisma for persistence.
 */

import { prisma } from '../../db/prisma.js';

import { Friend, FriendRequest } from './friends.types.js';

export class FriendsService {
  /**
   * Send friend request
   * PRODUCT_BIBLE.md Section 4.1 - Send Friend Request
   */
  async sendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    // Prevent self-friending
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Check if already friends (accepted)
    const existingFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: fromUserId, friendId: toUserId, status: 'accepted' },
          { userId: toUserId, friendId: fromUserId, status: 'accepted' },
        ],
      },
    });
    if (existingFriend) {
      throw new Error('Already friends');
    }

    // Check if request already exists (pending)
    const existingRequest = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: fromUserId, friendId: toUserId, status: 'pending' },
          { userId: toUserId, friendId: fromUserId, status: 'pending' },
        ],
      },
    });
    if (existingRequest) {
      throw new Error('Friend request already pending');
    }

    // Create friend request
    const request = await prisma.friend.create({
      data: {
        userId: fromUserId,
        friendId: toUserId,
        status: 'pending',
      },
    });

    return this.mapToFriendRequest(request);
  }

  /**
   * Accept friend request
   * PRODUCT_BIBLE.md Section 4.1 - Accept Request
   */
  async acceptRequest(requestId: string, userId: string): Promise<Friend> {
    // Find the request
    const request = await prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // Check authorization (only the recipient can accept)
    if (request.friendId !== userId) {
      throw new Error('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    // Use transaction to update both records
    const result = await prisma.$transaction(async (tx) => {
      // Update the request status to accepted
      const accepted = await tx.friend.update({
        where: { id: requestId },
        data: {
          status: 'accepted',
          updatedAt: new Date(),
        },
      });

      // Create reverse friendship (if not exists)
      const reverseExists = await tx.friend.findFirst({
        where: {
          userId: request.friendId,
          friendId: request.userId,
        },
      });

      if (!reverseExists) {
        await tx.friend.create({
          data: {
            userId: request.friendId,
            friendId: request.userId,
            status: 'accepted',
          },
        });
      } else {
        await tx.friend.update({
          where: { id: reverseExists.id },
          data: {
            status: 'accepted',
            updatedAt: new Date(),
          },
        });
      }

      return accepted;
    });

    return this.mapToFriend(result);
  }

  /**
   * Reject friend request
   * PRODUCT_BIBLE.md Section 4.1 - Reject Request
   */
  async rejectRequest(requestId: string, userId: string): Promise<void> {
    const request = await prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // Check authorization (only the recipient can reject)
    if (request.friendId !== userId) {
      throw new Error('Not authorized to reject this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    await prisma.friend.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Cancel friend request (sender cancels)
   * PRODUCT_BIBLE.md Section 4.1 - Cancel Pending Request
   */
  async cancelRequest(requestId: string, userId: string): Promise<void> {
    const request = await prisma.friend.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // Check authorization (only the sender can cancel)
    if (request.userId !== userId) {
      throw new Error('Not authorized to cancel this request');
    }

    if (request.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    await prisma.friend.delete({
      where: { id: requestId },
    });
  }

  /**
   * Get friends list
   * PRODUCT_BIBLE.md Section 4.1 - Friends List
   */
  async getFriends(userId: string): Promise<Friend[]> {
    const friends = await prisma.friend.findMany({
      where: {
        userId,
        status: 'accepted',
      },
    });

    return friends.map((f) => this.mapToFriend(f));
  }

  /**
   * Remove friend
   * PRODUCT_BIBLE.md Section 4.1 - Remove Friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    // Delete both directions in one transaction
    await prisma.$transaction(async (tx) => {
      // Delete user -> friend
      await tx.friend.deleteMany({
        where: {
          userId,
          friendId,
          status: 'accepted',
        },
      });

      // Delete friend -> user
      await tx.friend.deleteMany({
        where: {
          userId: friendId,
          friendId: userId,
          status: 'accepted',
        },
      });
    });
  }

  /**
   * Get incoming friend requests (pending requests sent to user)
   * PRODUCT_BIBLE.md Section 4.1 - Incoming Requests
   */
  async getIncomingRequests(userId: string): Promise<FriendRequest[]> {
    const requests = await prisma.friend.findMany({
      where: {
        friendId: userId,
        status: 'pending',
      },
    });

    return requests.map((r) => ({
      id: r.id,
      fromUserId: r.userId,
      toUserId: r.friendId,
      status: r.status as any,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Get outgoing friend requests (pending requests sent by user)
   * PRODUCT_BIBLE.md Section 4.1 - Outgoing Requests
   */
  async getOutgoingRequests(userId: string): Promise<FriendRequest[]> {
    const requests = await prisma.friend.findMany({
      where: {
        userId,
        status: 'pending',
      },
    });

    return requests.map((r) => ({
      id: r.id,
      fromUserId: r.userId,
      toUserId: r.friendId,
      status: r.status as any,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Search players by username (for friend request)
   * PRODUCT_BIBLE.md Section 4.1 - Search Players
   */
  async searchPlayers(
    userId: string,
    query: string
  ): Promise<Array<{ id: string; username: string; avatar?: string; isFriend: boolean }>> {
    const users = await prisma.profile.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      take: 20,
    });

    // Get user's friends list
    const friendsList = await prisma.friend.findMany({
      where: {
        userId,
        status: 'accepted',
      },
      select: {
        friendId: true,
      },
    });

    const friendIds = new Set(friendsList.map((f) => f.friendId));

    return users.map((profile) => ({
      id: profile.userId,
      username: profile.username,
      avatar: profile.avatar || undefined,
      isFriend: friendIds.has(profile.userId),
    }));
  }

  /**
   * Check if two users are friends
   */
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friend = await prisma.friend.findFirst({
      where: {
        userId: userId1,
        friendId: userId2,
        status: 'accepted',
      },
    });

    return !!friend;
  }

  /**
   * Get friend count for a user
   */
  async getFriendCount(userId: string): Promise<number> {
    return prisma.friend.count({
      where: {
        userId,
        status: 'accepted',
      },
    });
  }

  /**
   * Map Prisma Friend to Friend type
   */
  private mapToFriend(data: any): Friend {
    return {
      id: data.id,
      userId: data.userId,
      friendId: data.friendId,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Map Prisma Friend to FriendRequest type
   */
  private mapToFriendRequest(data: any): FriendRequest {
    return {
      id: data.id,
      fromUserId: data.userId,
      toUserId: data.friendId,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}

// Export singleton instance
export const friendsService = new FriendsService();
