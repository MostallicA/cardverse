/**
 * Matchmaking Integration - Routes
 *
 * API routes for matchmaking integration endpoints
 */

import { Router } from 'express';

import {
  createMatchFromQueue,
  startMatch,
  setPlayerReady,
  playCard,
  declareHokm,
  reconnectPlayer,
  getMatchState,
  getMatchStatistics,
  cleanupMatch,
} from './matchmaking-integration.controller';

const router: Router = Router();

// Match creation and management
router.post('/create', createMatchFromQueue);
router.post('/start', startMatch);
router.post('/ready', setPlayerReady);

// Gameplay actions
router.post('/play-card', playCard);
router.post('/declare-hokm', declareHokm);

// Reconnection
router.post('/reconnect', reconnectPlayer);

// Match state and statistics
router.get('/state/:matchId', getMatchState);
router.get('/statistics/:matchId', getMatchStatistics);

// Cleanup
router.post('/cleanup', cleanupMatch);

export default router;
