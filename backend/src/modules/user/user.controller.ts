// User Management Controller
// Route handlers for user endpoints
// Follows ARCHITECTURE.md - Hexagonal Architecture (controllers are adapters)

import { Request, Response } from 'express';

import { ResponseHelper } from '../../utils/response.js';

import { UserService } from './user.service.js';

export class UserController {
  /**
   * GET /api/v1/users/:id
   * Get user profile by ID
   */
  static async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id as string;

    const profile = await UserService.getProfile(userId);

    if (!profile) {
      res.status(404).json(ResponseHelper.error('USER_NOT_FOUND', 'User not found'));
      return;
    }

    res.status(200).json(ResponseHelper.success(profile));
  }

  /**
   * PATCH /api/v1/users/:id
   * Update user profile
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id as string;

    const updatedProfile = await UserService.updateProfile(userId, req.body);

    res.status(200).json(
      ResponseHelper.success(updatedProfile, {
        message: 'Profile updated successfully',
      })
    );
  }

  /**
   * GET /api/v1/users
   * Search users or get all users
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    const query = {
      username: req.query.username as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    };

    const result = await UserService.searchUsers(query);

    res.status(200).json(ResponseHelper.paginated(result.users, result.pagination));
  }

  /**
   * POST /api/v1/users
   * Create a new user profile (called internally after auth)
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    const { userId, username } = req.body;

    const profile = await UserService.createProfile(userId, username);

    res.status(201).json(
      ResponseHelper.created(profile, {
        message: 'User profile created successfully',
      })
    );
  }
}
