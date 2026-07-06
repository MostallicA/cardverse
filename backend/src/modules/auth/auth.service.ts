// Authentication Service
// Business logic for Guest and Google authentication
// Based on ARCHITECTURE.md - Authentication Module (Platform Layer)

import {
  GuestAuthRequest,
  GoogleAuthRequest,
  UpgradeRequest,
  AuthResponse,
  UserPayload,
} from './auth.types.js';

// Temporary in-memory store (will be replaced with database)
const users: Map<string, UserPayload> = new Map();
const guestMap: Map<string, string> = new Map(); // deviceId -> userId

export class AuthService {
  /**
   * Guest authentication - creates or retrieves guest user
   * PRODUCT_BIBLE.md Section 3.1: Guest Account - Instant access, no registration
   */
  static async guestAuth(request: GuestAuthRequest): Promise<AuthResponse> {
    const { deviceId } = request;

    // Check if guest already exists
    const existingUserId = guestMap.get(deviceId);
    if (existingUserId) {
      const user = users.get(existingUserId);
      if (user) {
        return this.buildAuthResponse(user);
      }
    }

    // Create new guest user
    const userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: UserPayload = {
      id: userId,
      accountType: 'guest',
      provider: 'guest',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(userId, user);
    guestMap.set(deviceId, userId);

    return this.buildAuthResponse(user);
  }

  /**
   * Google authentication - creates or retrieves Google user
   * PRODUCT_BIBLE.md Section 3.1: Google Account - Permanent account
   */
  static async googleAuth(request: GoogleAuthRequest): Promise<AuthResponse> {
    const { idToken } = request;

    // TODO: Verify Google ID token with Google APIs
    // For now, create a user based on the token
    const userId = `google_${this.hashToken(idToken)}`;

    const existingUser = users.get(userId);
    if (existingUser) {
      return this.buildAuthResponse(existingUser);
    }

    const user: UserPayload = {
      id: userId,
      accountType: 'google',
      provider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(userId, user);

    return this.buildAuthResponse(user);
  }

  /**
   * Upgrade guest account to Google account
   * PRODUCT_BIBLE.md Section 3.1: Guest can upgrade without losing progress
   */
  static async upgradeGuest(request: UpgradeRequest): Promise<AuthResponse> {
    const { deviceId, idToken } = request;

    const guestUserId = guestMap.get(deviceId);
    if (!guestUserId) {
      throw new Error('Guest account not found');
    }

    const googleUserId = `google_${this.hashToken(idToken)}`;
    const guestUser = users.get(guestUserId);

    if (!guestUser) {
      throw new Error('Guest user not found');
    }

    // Create upgraded user preserving creation date
    const upgradedUser: UserPayload = {
      ...guestUser,
      id: googleUserId,
      accountType: 'google',
      provider: 'google',
      updatedAt: new Date(),
    };

    users.delete(guestUserId);
    guestMap.delete(deviceId);
    users.set(googleUserId, upgradedUser);

    return this.buildAuthResponse(upgradedUser);
  }

  /**
   * Get current user by ID
   */
  static async getUserById(userId: string): Promise<UserPayload | null> {
    return users.get(userId) || null;
  }

  /**
   * Build authentication response with mock tokens
   */
  private static buildAuthResponse(user: UserPayload): AuthResponse {
    return {
      user,
      tokens: {
        accessToken: `mock_access_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}`,
        expiresIn: 3600,
      },
    };
  }

  /**
   * Simple hash for token mapping (temporary)
   */
  private static hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
