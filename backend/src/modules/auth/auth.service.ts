// Authentication Service
// Business logic for Guest and Google authentication
// Based on ARCHITECTURE.md - Authentication Module (Platform Layer)

import { generateToken } from '../../auth/jwt.service.js';
import { prisma } from '../../db/prisma.js';

import {
  GuestAuthRequest,
  GoogleAuthRequest,
  UpgradeRequest,
  AuthResponse,
  UserPayload,
} from './auth.types.js';

export class AuthService {
  /**
   * Guest authentication - creates or retrieves guest user
   * PRODUCT_BIBLE.md Section 3.1: Guest Account - Instant access, no registration
   */
  static async guestAuth(_request: GuestAuthRequest): Promise<AuthResponse> {
    // deviceId is intentionally unused in current implementation (reserved for future)
    // const { deviceId: _deviceId } = _request;

    // Check if guest already exists in database
    const existingGuest = await prisma.user.findFirst({
      where: {
        accountType: 'guest',
        // deviceId should be stored in a separate field or session table
        // For now, we'll use a simple approach with username
      },
    });

    if (existingGuest) {
      const user: UserPayload = {
        id: existingGuest.id,
        accountType: existingGuest.accountType as 'guest' | 'google',
        provider: 'guest',
        createdAt: existingGuest.createdAt,
        updatedAt: existingGuest.updatedAt,
      };
      return this.buildAuthResponse(user);
    }

    // Create new guest user
    const guestUsername = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const newUser = await prisma.user.create({
      data: {
        email: `${guestUsername}@guest.local`,
        username: guestUsername,
        accountType: 'guest',
        isActive: true,
      },
    });

    const user: UserPayload = {
      id: newUser.id,
      accountType: newUser.accountType as 'guest' | 'google',
      provider: 'guest',
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return this.buildAuthResponse(user);
  }

  /**
   * Google authentication - creates or retrieves Google user
   * PRODUCT_BIBLE.md Section 3.1: Google Account - Permanent account
   */
  static async googleAuth(request: GoogleAuthRequest): Promise<AuthResponse> {
    const { idToken } = request;

    // TODO: Verify Google ID token with Google APIs
    // For now, hash token for unique identification
    const googleId = `google_${this.hashToken(idToken)}`;

    // Upsert user (create or update)
    const user = await prisma.user.upsert({
      where: { email: `${googleId}@google.local` },
      update: { updatedAt: new Date() },
      create: {
        email: `${googleId}@google.local`,
        username: `google_${this.hashToken(idToken).substring(0, 8)}`,
        accountType: 'google',
        isActive: true,
      },
    });

    const userPayload: UserPayload = {
      id: user.id,
      accountType: user.accountType as 'guest' | 'google',
      provider: 'google',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return this.buildAuthResponse(userPayload);
  }

  /**
   * Upgrade guest account to Google account
   * PRODUCT_BIBLE.md Section 3.1: Guest can upgrade without losing progress
   */
  static async upgradeGuest(request: UpgradeRequest): Promise<AuthResponse> {
    const { idToken } = request;

    // Find guest user by deviceId (if we had deviceId in DB)
    // For now, we'll use a simpler approach
    const googleId = `google_${this.hashToken(idToken)}`;

    // Find guest user by username pattern
    const guestUser = await prisma.user.findFirst({
      where: {
        accountType: 'guest',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!guestUser) {
      throw new Error('Guest account not found');
    }

    // Upsert google user
    const upgradedUser = await prisma.user.upsert({
      where: { email: `${googleId}@google.local` },
      update: {
        username: guestUser.username,
        accountType: 'google',
        updatedAt: new Date(),
      },
      create: {
        email: `${googleId}@google.local`,
        username: guestUser.username,
        accountType: 'google',
        isActive: true,
      },
    });

    // Delete guest user
    await prisma.user.delete({
      where: { id: guestUser.id },
    });

    const userPayload: UserPayload = {
      id: upgradedUser.id,
      accountType: upgradedUser.accountType as 'guest' | 'google',
      provider: 'google',
      createdAt: upgradedUser.createdAt,
      updatedAt: upgradedUser.updatedAt,
    };

    return this.buildAuthResponse(userPayload);
  }

  /**
   * Get current user by ID
   */
  static async getUserById(userId: string): Promise<UserPayload | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;

    return {
      id: user.id,
      accountType: user.accountType as 'guest' | 'google',
      provider: user.accountType === 'guest' ? 'guest' : 'google',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private static buildAuthResponse(user: UserPayload): AuthResponse {
    return {
      user,
      tokens: {
        accessToken: generateToken(user.id),
        refreshToken: generateToken(user.id), // TODO: implement refresh token
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
