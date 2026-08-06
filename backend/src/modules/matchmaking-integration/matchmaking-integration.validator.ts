/**
 * Matchmaking Integration - Validators
 *
 * Validation schemas for matchmaking integration API endpoints
 */

import Joi from 'joi';

// Validator for creating a match from queue
export const createMatchFromQueueSchema = Joi.object({
  queueEntryId: Joi.string().required(),
  players: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().required(),
        username: Joi.string().required(),
        skillRating: Joi.number().min(0).default(0),
        fairPlayScore: Joi.number().min(0).max(100).default(100),
        region: Joi.string().default('default'),
      })
    )
    .length(4)
    .required(),
  gameMode: Joi.string().valid('RANKED', 'FRIENDLY', 'PRACTICE').required(),
});

// Validator for starting a match
export const startMatchSchema = Joi.object({
  matchId: Joi.string().required(),
});

// Validator for setting player ready status
export const setPlayerReadySchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required(),
  isReady: Joi.boolean().required(),
});

// Validator for playing a card
export const playCardSchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required(),
  cardId: Joi.string().required(),
});

// Validator for declaring Hokm
export const declareHokmSchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required(),
  mode: Joi.string().valid('HOKM', 'SARAS', 'NARS', 'TAK_NARS').required(),
  suit: Joi.string().valid('KHESHT', 'PIK', 'DEL', 'KHAJ').optional(),
});

// Validator for reconnecting
export const reconnectSchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required(),
});

// Validator for getting match state
export const getMatchStateSchema = Joi.object({
  matchId: Joi.string().required(),
});

// Validator for getting match statistics
export const getMatchStatisticsSchema = Joi.object({
  matchId: Joi.string().required(),
});

// Validator for cleaning up match
export const cleanupMatchSchema = Joi.object({
  matchId: Joi.string().required(),
});
