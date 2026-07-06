// API v1 Routes
// Follows API.md Versioning Strategy - URL-based versioning
// All v1 endpoints are mounted under /api/v1

import { Router, Request, Response } from 'express';
import { APP_NAME, APP_VERSION } from '@cardverse/shared';

import friendsRoutes from '../../modules/friends/friends.routes.js';
import { ResponseHelper } from '../../utils/response.js';
import authRoutes from '../../modules/auth/auth.routes.js';
import userRoutes from '../../modules/user/user.routes.js';

const router: Router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json(
    ResponseHelper.success({
      status: 'healthy',
      service: APP_NAME,
      version: APP_VERSION,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  );
});

// API Info endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json(
    ResponseHelper.success({
      name: APP_NAME,
      version: APP_VERSION,
      environment: process.env.NODE_ENV || 'development',
      documentation: '/api/v1',
      endpoints: {
        health: '/api/v1/health',
        auth: {
          guest: 'POST /api/v1/auth/guest',
          google: 'POST /api/v1/auth/google',
          upgrade: 'POST /api/v1/auth/upgrade',
          me: 'GET /api/v1/auth/me',
        },
        users: {
          create: 'POST /api/v1/users',
          search: 'GET /api/v1/users?username=',
          getById: 'GET /api/v1/users/:id',
          update: 'PATCH /api/v1/users/:id',
        },
      },
    })
  );
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Placeholder for future route groups
// router.use('/matches', matchRoutes);

export default router;

// Friends routes
router.use('/friends', friendsRoutes);
