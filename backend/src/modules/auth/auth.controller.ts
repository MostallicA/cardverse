// Authentication Controller
// Route handlers for auth endpoints
// Follows ARCHITECTURE.md - Hexagonal Architecture (controllers are adapters)

import { Request, Response } from 'express';

import { ResponseHelper } from '../../utils/response.js';

import { AuthService } from './auth.service.js';
import { GuestAuthRequest, GoogleAuthRequest, UpgradeRequest } from './auth.types.js';

export class AuthController {
  /**
   * POST /api/v1/auth/guest
   * Guest login - creates new guest or returns existing
   */
  static async guestLogin(req: Request, res: Response): Promise<void> {
    const request: GuestAuthRequest = {
      deviceId: req.body.deviceId,
    };

    const response = await AuthService.guestAuth(request);

    res.status(200).json(
      ResponseHelper.success(response, {
        message: 'Guest authentication successful',
      })
    );
  }

  /**
   * POST /api/v1/auth/google
   * Google login - creates new Google user or returns existing
   */
  static async googleLogin(req: Request, res: Response): Promise<void> {
    const request: GoogleAuthRequest = {
      idToken: req.body.idToken,
    };

    const response = await AuthService.googleAuth(request);

    res.status(200).json(
      ResponseHelper.success(response, {
        message: 'Google authentication successful',
      })
    );
  }

  /**
   * POST /api/v1/auth/upgrade
   * Upgrade guest account to Google account
   */
  static async upgradeGuest(req: Request, res: Response): Promise<void> {
    const request: UpgradeRequest = {
      deviceId: req.body.deviceId,
      idToken: req.body.idToken,
    };

    const response = await AuthService.upgradeGuest(request);

    res.status(200).json(
      ResponseHelper.success(response, {
        message: 'Account upgraded successfully',
      })
    );
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user
   */
  static async getCurrentUser(_req: Request, res: Response): Promise<void> {
    // TODO: Extract user ID from JWT token in Authorization header
    // For now, return a placeholder
    res.status(200).json(
      ResponseHelper.success({
        message: 'Authentication endpoint active',
        hint: 'Send a Bearer token from guest or google login to get user info',
      })
    );
  }
}
