// Authentication Routes
// Route definitions for auth endpoints
// Follows API.md - RESTful design, URL versioning

import { Router } from 'express';

import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';

import { AuthController } from './auth.controller.js';
import { guestAuthSchema, googleAuthSchema, upgradeSchema } from './auth.validator.js';

const router: Router = Router();

// POST /api/v1/auth/guest - Guest login
router.post('/guest', validate(guestAuthSchema), asyncHandler(AuthController.guestLogin));

// POST /api/v1/auth/google - Google login
router.post('/google', validate(googleAuthSchema), asyncHandler(AuthController.googleLogin));

// POST /api/v1/auth/upgrade - Upgrade guest to Google
router.post('/upgrade', validate(upgradeSchema), asyncHandler(AuthController.upgradeGuest));

// GET /api/v1/auth/me - Get current user
router.get('/me', asyncHandler(AuthController.getCurrentUser));

export default router;
