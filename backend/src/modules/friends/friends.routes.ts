// Friends Routes
// Based on API.md Section 4 - Endpoint Standards

import { Router } from 'express';

import { validate } from '../../middleware/validate.js';

import { FriendsController } from './friends.controller.js';
import {
  sendFriendRequestSchema,
  friendIdParamSchema,
  searchQuerySchema,
} from './friends.validator.js';

const router = Router();
const controller = new FriendsController();

// Friend requests
router.post('/requests', validate(sendFriendRequestSchema), controller.sendRequest);

router.get('/requests/incoming', controller.getIncomingRequests);
router.get('/requests/outgoing', controller.getOutgoingRequests);

router.put(
  '/requests/:id/accept',
  validate(friendIdParamSchema, 'params'),
  controller.acceptRequest
);

router.delete(
  '/requests/:id/reject',
  validate(friendIdParamSchema, 'params'),
  controller.rejectRequest
);

router.delete(
  '/requests/:id/cancel',
  validate(friendIdParamSchema, 'params'),
  controller.cancelRequest
);

// Friends list
router.get('/', controller.getFriends);

router.delete('/:id', validate(friendIdParamSchema, 'params'), controller.removeFriend);

// Search
router.get('/search', validate(searchQuerySchema, 'query'), controller.searchPlayers);

export default router;
