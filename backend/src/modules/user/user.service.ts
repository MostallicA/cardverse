// User Management Service
// Business logic for user profiles and search
// Based on ARCHITECTURE.md - User Management Module (Platform Layer)

import {
  UserProfile,
  UpdateProfileRequest,
  UserSearchQuery,
  UserSearchResult,
} from './user.types.js';

// Temporary in-memory store (will be replaced with database)
const profiles: Map<string, UserProfile> = new Map();
const usernames: Set<string> = new Set();

export class UserService {
  /**
   * Create a new user profile
   * Called after authentication when user is first created
   */
  static async createProfile(userId: string, username: string): Promise<UserProfile> {
    // Check username uniqueness (PRODUCT_BIBLE.md Section 3.2)
    if (usernames.has(username.toLowerCase())) {
      throw new Error('Username already taken');
    }

    // Validate username format
    this.validateUsername(username);

    const profile: UserProfile = {
      id: userId,
      username,
      avatar: 'default_avatar',
      avatarFrame: 'default_frame',
      countryFlag: 'ww',
      level: 1,
      rank: 'bronze',
      status: 'online',
      joinDate: new Date(),
      lastOnline: new Date(),
    };

    profiles.set(userId, profile);
    usernames.add(username.toLowerCase());

    return profile;
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    return profiles.get(userId) || null;
  }

  /**
   * Update user profile
   * PRODUCT_BIBLE.md Section 3.2 - Profile Information
   */
  static async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<UserProfile> {
    const profile = profiles.get(userId);
    if (!profile) {
      throw new Error('User not found');
    }

    // Handle username change
    if (updates.username) {
      // Check if new username is available
      if (updates.username.toLowerCase() !== profile.username.toLowerCase()) {
        if (usernames.has(updates.username.toLowerCase())) {
          throw new Error('Username already taken');
        }
        this.validateUsername(updates.username);

        // Update username tracking
        usernames.delete(profile.username.toLowerCase());
        usernames.add(updates.username.toLowerCase());
      }
    }

    // Update profile fields
    const updatedProfile: UserProfile = {
      ...profile,
      username: updates.username || profile.username,
      avatar: updates.avatar || profile.avatar,
      avatarFrame: updates.avatarFrame || profile.avatarFrame,
      countryFlag: updates.countryFlag || profile.countryFlag,
      lastOnline: new Date(),
    };

    profiles.set(userId, updatedProfile);

    return updatedProfile;
  }

  /**
   * Search users by username
   * PRODUCT_BIBLE.md Section 4.1 - Search Players
   */
  static async searchUsers(query: UserSearchQuery): Promise<UserSearchResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const searchTerm = query.username?.toLowerCase() || '';

    // Filter users by username
    let filteredUsers = Array.from(profiles.values());

    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
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
    return Array.from(profiles.values());
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
