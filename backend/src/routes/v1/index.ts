// API v1 Routes
// Follows API.md Versioning Strategy - URL-based versioning
// All v1 endpoints are mounted under /api/v1

import { Router, Request, Response } from 'express';
import { APP_NAME, APP_VERSION } from '@cardverse/shared';

import presenceRoutes from '../../modules/presence/presence.routes';
import friendsRoutes from '../../modules/friends/friends.routes.js';
import { ResponseHelper } from '../../utils/response.js';
import authRoutes from '../../modules/auth/auth.routes.js';
import userRoutes from '../../modules/user/user.routes.js';
import chatRoutes from '../../modules/chat/chat.routes';
import notificationsRoutes from '../../modules/notifications/notifications.routes';
import matchmakingRoutes from '../../modules/matchmaking/matchmaking.routes';
import walletRoutes from '../../modules/wallet/wallet.routes';

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
        chat: {
          send: 'POST /api/v1/chat/messages',
          getMessages: 'GET /api/v1/chat/messages/:friendId',
          deleteMessage: 'DELETE /api/v1/chat/messages/:messageId',
          getRooms: 'GET /api/v1/chat/rooms',
          getUnread: 'GET /api/v1/chat/unread',
          markAsRead: 'POST /api/v1/chat/read',
        },
        notifications: {
          get: 'GET /api/v1/notifications',
          getUnread: 'GET /api/v1/notifications/unread',
          markAsRead: 'POST /api/v1/notifications/read',
          delete: 'DELETE /api/v1/notifications/:notificationId',
          deleteAll: 'DELETE /api/v1/notifications',
          getPreferences: 'GET /api/v1/notifications/preferences',
          updatePreferences: 'PUT /api/v1/notifications/preferences',
        },
        matchmaking: {
          joinQueue: 'POST /api/v1/matchmaking/queue',
          leaveQueue: 'DELETE /api/v1/matchmaking/queue',
          getStatus: 'GET /api/v1/matchmaking/queue/status',
          findMatch: 'POST /api/v1/matchmaking/find',
          getStats: 'GET /api/v1/matchmaking/stats',
          getMatch: 'GET /api/v1/matchmaking/matches/:matchId',
        },
        wallet: {
          get: 'GET /api/v1/wallet',
          balance: 'GET /api/v1/wallet/balance',
          add: 'POST /api/v1/wallet/add',
          spend: 'POST /api/v1/wallet/spend',
          transactions: 'GET /api/v1/wallet/transactions',
          dailyReward: 'POST /api/v1/wallet/daily-reward',
          dailyRewardStatus: 'GET /api/v1/wallet/daily-reward/status',
          checkBalance: 'POST /api/v1/wallet/check-balance',
        },
      },
    })
  );
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Friends routes
router.use('/friends', friendsRoutes);

// Presence routes
router.use('/presence', presenceRoutes);

// Chat routes
router.use('/chat', chatRoutes);

// Notifications routes
router.use('/notifications', notificationsRoutes);

// Matchmaking routes
router.use('/matchmaking', matchmakingRoutes);

// Wallet routes
router.use('/wallet', walletRoutes);

// Placeholder for future route groups
// router.use('/matches', matchRoutes);

export default router;
