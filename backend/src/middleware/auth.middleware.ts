/**
 * Authentication Middleware
 * Based on API.md Section 3 - Authentication
 * Verifies JWT token and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';

import { ResponseHelper } from '../utils/response.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { verifyToken } from '../auth/jwt.service.js';

/**
 * Authentication middleware - verifies token and sets req.user
 * Follows API.md Section 3: Authentication Token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json(ResponseHelper.error('UNAUTHORIZED', 'No token provided'));
      return;
    }

    // 2. Extract token (Bearer <token>)
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    // 3. Validate token and extract user using JWT
    let userId: string | null = null;

    try {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        console.log('[AUTH] Extracted userId from JWT:', userId);
      }
    } catch (error) {
      console.log('[AUTH] JWT verification error:', error);
    }

    // 4. If token is invalid, return 401
    if (!userId) {
      console.log('[AUTH] Invalid token format');
      res.status(401).json(ResponseHelper.error('UNAUTHORIZED', 'Invalid token'));
      return;
    }

    // 5. Get user from database/service
    console.log('[AUTH] Looking for user with ID:', userId);
    const user = await AuthService.getUserById(userId);
    console.log('[AUTH] User found:', user ? 'YES' : 'NO');

    if (!user) {
      res.status(401).json(ResponseHelper.error('UNAUTHORIZED', 'User not found'));
      return;
    }

    // 6. Attach user to request
    req.userId = user.id;
    req.user = {
      id: user.id,
      accountType: user.accountType,
    };

    console.log('[AUTH] Authentication successful for user:', user.id);
    next();
  } catch (error) {
    console.log('[AUTH] Error during authentication:', error);
    res.status(401).json(ResponseHelper.error('UNAUTHORIZED', 'Invalid token'));
    return;
  }
};

/**
 * Optional authentication - doesn't block unauthenticated requests
 * Useful for endpoints that work with or without auth
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      let userId: string | null = null;

      try {
        const decoded = verifyToken(token);
        if (decoded) {
          userId = decoded.userId;
        }
      } catch {
        // Silent fail for optional auth
      }

      if (userId) {
        const user = await AuthService.getUserById(userId);
        if (user) {
          req.userId = user.id;
          req.user = {
            id: user.id,
            accountType: user.accountType,
          };
        }
      }
    }
    next();
  } catch {
    next();
  }
};
