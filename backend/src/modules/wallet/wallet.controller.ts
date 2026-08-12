/**
 * Wallet - Controller Layer
 * CV-MOD-008
 *
 * Handles HTTP requests for wallet management including balance,
 * transactions, coin operations, and daily rewards.
 */

import { Request, Response } from 'express';

import { sendSuccess, sendError } from '../../utils/controller.utils.js';

import { walletService } from './wallet.service.js';
import {
  validateAddCoins,
  validateSpendCoins,
  validateGetTransactions,
} from './wallet.validator.js';
import { TransactionType, TransactionSource } from './wallet.types.js';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class WalletController {
  /**
   * Get wallet for current user
   * GET /api/v1/wallet
   */
  getWallet = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const wallet = await walletService.getWallet(userId);
      return sendSuccess(res, wallet, 'Wallet retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get wallet', 500);
    }
  };

  /**
   * Get balance for current user
   * GET /api/v1/wallet/balance
   */
  getBalance = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const balance = await walletService.getBalance(userId);
      return sendSuccess(res, balance, 'Balance retrieved successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to get balance', 500);
    }
  };

  /**
   * Add coins to wallet (admin or system)
   * POST /api/v1/wallet/add
   */
  addCoins = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateAddCoins(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const transaction = await walletService.addCoins(userId, req.body);
      return sendSuccess(res, transaction, 'Coins added successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to add coins', 500);
    }
  };

  /**
   * Spend coins from wallet
   * POST /api/v1/wallet/spend
   */
  spendCoins = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Validate request
      const validation = validateSpendCoins(req.body);
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const transaction = await walletService.spendCoins(userId, req.body);
      return sendSuccess(res, transaction, 'Coins spent successfully');
    } catch (error) {
      return sendError(res, error instanceof Error ? error.message : 'Failed to spend coins', 500);
    }
  };

  /**
   * Get transaction history
   * GET /api/v1/wallet/transactions
   */
  getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      // Parse query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const type = req.query.type as TransactionType | undefined;
      const source = req.query.source as TransactionSource | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      // Validate query
      const validation = validateGetTransactions({
        limit,
        offset,
        type,
        source,
        startDate,
        endDate,
      });
      if (!validation.valid) {
        return sendError(res, 'Validation failed', 400, validation.errors);
      }

      const result = await walletService.getTransactions(userId, {
        limit,
        offset,
        type,
        source,
        startDate,
        endDate,
      });

      return sendSuccess(res, result, 'Transactions retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get transactions',
        500
      );
    }
  };

  /**
   * Claim daily reward
   * POST /api/v1/wallet/daily-reward
   */
  claimDailyReward = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const result = await walletService.claimDailyReward(userId);
      if (!result.claimed) {
        return sendSuccess(
          res,
          result,
          `Daily reward already claimed. Next claim at ${result.nextClaimAt}`
        );
      }

      return sendSuccess(
        res,
        result,
        `Daily reward claimed successfully! ${result.amount} coins earned (Streak: ${result.streak})`
      );
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to claim daily reward',
        500
      );
    }
  };

  /**
   * Get daily reward status
   * GET /api/v1/wallet/daily-reward/status
   */
  getDailyRewardStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const status = await walletService.getDailyRewardStatus(userId);
      return sendSuccess(res, status, 'Daily reward status retrieved successfully');
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get daily reward status',
        500
      );
    }
  };

  /**
   * Check if user has sufficient balance
   * POST /api/v1/wallet/check-balance
   */
  checkBalance = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User not authenticated', 401);
      }

      const { amount } = req.body;
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return sendError(res, 'Valid amount is required', 400);
      }

      const hasSufficient = await walletService.hasSufficientBalance(userId, amount);
      return sendSuccess(
        res,
        { hasSufficient, amount },
        hasSufficient ? 'Sufficient balance' : 'Insufficient balance'
      );
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : 'Failed to check balance',
        500
      );
    }
  };
}

// Export singleton instance
export const walletController = new WalletController();
