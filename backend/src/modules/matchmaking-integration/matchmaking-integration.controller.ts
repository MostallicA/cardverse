import { Request, Response } from 'express';

import { asyncHandler } from '../../middleware/asyncHandler.js';
import { engineService } from '../../engine/engine.service.js';

import { matchmakingIntegration } from './matchmaking-integration.service.js';
import {
  createMatchFromQueueSchema,
  startMatchSchema,
  setPlayerReadySchema,
  playCardSchema,
  declareHokmSchema,
  reconnectSchema,
  getMatchStateSchema,
  getMatchStatisticsSchema,
  cleanupMatchSchema,
} from './matchmaking-integration.validator.js';

/**
 * Create a match from matchmaking queue
 */
export const createMatchFromQueue = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createMatchFromQueueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const result = matchmakingIntegration.createMatchFromQueue(value);

  if (!result.success) {
    return res
      .status(400)
      .json({ success: false, message: result.error || 'Failed to create match' });
  }

  return res.status(200).json({
    success: true,
    matchId: result.matchId,
    matchState: result.matchState,
    message: 'Match created successfully',
  });
});

/**
 * Start a match
 */
export const startMatch = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = startMatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const success = matchmakingIntegration.startMatch(value.matchId);

  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to start match' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    message: 'Match started successfully',
  });
});

/**
 * Set player ready status
 */
export const setPlayerReady = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = setPlayerReadySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const success = matchmakingIntegration.setPlayerReady(value.matchId, value.userId, value.isReady);

  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to set ready status' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    userId: value.userId,
    isReady: value.isReady,
    message: 'Ready status updated',
  });
});

/**
 * Play a card
 */
export const playCard = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = playCardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const success = matchmakingIntegration.playCard(value.matchId, value.userId, value.cardId);

  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to play card' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    userId: value.userId,
    cardId: value.cardId,
    message: 'Card played successfully',
  });
});

/**
 * Declare Hokm
 */
export const declareHokm = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = declareHokmSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const success = matchmakingIntegration.declareHokm(
    value.matchId,
    value.userId,
    value.mode,
    value.suit
  );

  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to declare Hokm' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    userId: value.userId,
    mode: value.mode,
    suit: value.suit,
    message: 'Hokm declared successfully',
  });
});

/**
 * Handle player reconnection
 */
export const reconnectPlayer = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = reconnectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const success = matchmakingIntegration.handlePlayerReconnect(value.matchId, value.userId);

  if (!success) {
    return res.status(400).json({ success: false, message: 'Failed to reconnect player' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    userId: value.userId,
    message: 'Player reconnected successfully',
  });
});

/**
 * Get match state
 */
export const getMatchState = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = getMatchStateSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  // ✅ Fix: return the full Engine MatchState
  const matchState = engineService.getMatchState(value.matchId);

  if (!matchState) {
    return res.status(404).json({ success: false, message: 'Match not found' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    state: matchState,
  });
});

/**
 * Get match statistics
 */
export const getMatchStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = getMatchStatisticsSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const statistics = await matchmakingIntegration.getMatchStatistics(value.matchId);

  if (!statistics) {
    return res.status(404).json({ success: false, message: 'Match not found' });
  }

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    statistics,
  });
});

/**
 * Cleanup match
 */
export const cleanupMatch = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = cleanupMatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  matchmakingIntegration.cleanupMatch(value.matchId);

  return res.status(200).json({
    success: true,
    matchId: value.matchId,
    message: 'Match cleaned up successfully',
  });
});
