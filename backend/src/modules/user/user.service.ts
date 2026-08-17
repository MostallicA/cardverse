// User Management Service
// Business logic for user profiles and search
// Based on ARCHITECTURE.md - User Management Module (Platform Layer)

import { prisma } from '../../db/prisma.js';

import {
  UserProfile,
  UpdateProfileRequest,
  UserSearchQuery,
  UserSearchResult,
} from './user.types.js';

export class UserService {
  /**
   * Create a new user profile
   * Called after authentication when user is first created
   */
  static async createProfile(userId: string, username: string): Promise<UserProfile> {
    // Validate username format
    this.validateUsername(username);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.profile) {
      throw new Error('Profile already exists for this user');
    }

    // Check username uniqueness
    const existingProfile = await prisma.profile.findUnique({
      where: { username },
    });

    if (existingProfile) {
      throw new Error('Username already taken');
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        username,
        avatar: 'default_avatar.png',
        avatarFrame: 'default_frame',
        country: 'IR',
        bio: '',
        level: 1,
      },
    });

    return this.mapToUserProfile(profile);
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    return this.mapToUserProfile(profile);
  }

  /**
   * Get user profile by username
   */
  static async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const profile = await prisma.profile.findUnique({
      where: { username },
    });

    if (!profile) {
      return null;
    }

    return this.mapToUserProfile(profile);
  }

  /**
   * Update user profile
   * PRODUCT_BIBLE.md Section 3.2 - Profile Information
   */
  static async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile> {
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new Error('User not found');
    }

    // Handle username change
    if (updates.username && updates.username !== existingProfile.username) {
      this.validateUsername(updates.username);

      // Check if new username is available
      const existing = await prisma.profile.findUnique({
        where: { username: updates.username },
      });

      if (existing) {
        throw new Error('Username already taken');
      }
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        username: updates.username,
        avatar: updates.avatar,
        avatarFrame: updates.avatarFrame,
        country: updates.countryFlag,
        updatedAt: new Date(),
      },
    });

    return this.mapToUserProfile(updatedProfile);
  }

  /**
   * Search users by username
   * PRODUCT_BIBLE.md Section 4.1 - Search Players
   */
  static async searchUsers(query: UserSearchQuery): Promise<UserSearchResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const searchTerm = query.username || '';

    // Build where clause
    const where = searchTerm
      ? {
          username: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
          deletedAt: null,
        }
      : {
          deletedAt: null,
        };

    // Get total count
    const total = await prisma.profile.count({ where });

    // Get paginated results
    const profiles = await prisma.profile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        username: 'asc',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users: profiles.map((p) => this.mapToUserProfile(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get all users (admin/debug)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    const profiles = await prisma.profile.findMany({
      where: { deletedAt: null },
      orderBy: {
        username: 'asc',
      },
    });

    return profiles.map((p) => this.mapToUserProfile(p));
  }

  /**
   * Map Prisma Profile to UserProfile type
   */
  private static mapToUserProfile(profile: any): UserProfile {
    return {
      id: profile.userId,
      username: profile.username,
      avatar: profile.avatar || 'default_avatar.png',
      avatarFrame: profile.avatarFrame || 'default_frame',
      countryFlag: profile.country || 'ww',
      level: profile.level || 1,
      rank: 'bronze', // Will be calculated from statistics
      status: 'online', // Will be from presence system
      joinDate: profile.createdAt,
      lastOnline: profile.updatedAt,
    };
  }

  /**
   * Validate username format
   * PRODUCT_BIBLE.md Section 3.2 - Username Rules:
   * - 3-20 characters
   * - Letters and numbers supported
   * - Underscore allowed
   * - No offensive words (basic check)
   */
  private static validateUsername(username: string): void {
    if (!username || username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers and underscores');
    }

    // Basic offensive word check (placeholder)
    const offensiveWords = ['admin', 'root', 'system', 'moderator'];
    if (offensiveWords.includes(username.toLowerCase())) {
      throw new Error('This username is reserved');
    }
  }
}
