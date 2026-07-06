// Friends Validation Schemas
// Based on API.md Section 5 - Request Standards

import Joi from 'joi';

export const sendFriendRequestSchema = Joi.object({
  toUserId: Joi.string().required().uuid(),
});

export const friendIdParamSchema = Joi.object({
  id: Joi.string().required().uuid(),
});

export const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(50).required(),
});
