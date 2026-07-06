// User Management Routes
// Route definitions for user endpoints
// Follows API.md - RESTful design, URL versioning

import { Router } from 'express';

import { asyncHandler } from '../../middleware/asyncHandler.js';
import { validate } from '../../middleware/validate.js';

import { UserController } from './user.controller.js';
import { updateProfileSchema, searchUsersSchema } from './user.validator.js';

const router: Router = Router();

// GET /api/v1/users/search - Search users
router.get('/search', validate(searchUsersSchema), asyncHandler(UserController.searchUsers));

// GET /api/v1/users - Get all users (with optional search)
router.get('/', validate(searchUsersSchema), asyncHandler(UserController.searchUsers));

// POST /api/v1/users - Create user profile
router.post('/', asyncHandler(UserController.createUser));

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', asyncHandler(UserController.getUser));

// PATCH /api/v1/users/:id - Update user profile
router.patch('/:id', validate(updateProfileSchema), asyncHandler(UserController.updateUser));

export default router;
