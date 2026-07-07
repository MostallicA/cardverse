/**
 * Wallet - Controller Layer
 * CV-MOD-008
 *
 * Handles HTTP requests for wallet management including balance,
 * transactions, coin operations, and daily rewards.
 */

import { Request, Response } from 'express';

import { successResponse, errorResponse } from '../../utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

import { walletService } from './wallet.service';
import { validateAddCoins, validateSpendCoins, validateGetTransactions } from './wallet.validator';
import { TransactionType, TransactionSource } from './wallet.types';

type AuthenticatedRequest = Request & { user?: { id: string } };

export class WalletController {
  /**
   * Get wallet for current user
   * GET /api/v1/wallet
   */
  getWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const wallet = await walletService.getWallet(userId);
    return successResponse(res, wallet, 'Wallet retrieved successfully');
  });

  /**
   * Get balance for current user
   * GET /api/v1/wallet/balance
   */
  getBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const balance = await walletService.getBalance(userId);
    return successResponse(res, balance, 'Balance retrieved successfully');
  });

  /**
   * Add coins to wallet (admin or system)
   * POST /api/v1/wallet/add
   */
  addCoins = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateAddCoins(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const transaction = await walletService.addCoins(userId, req.body);
    return successResponse(res, transaction, 'Coins added successfully');
  });

  /**
   * Spend coins from wallet
   * POST /api/v1/wallet/spend
   */
  spendCoins = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Validate request
    const validation = validateSpendCoins(req.body);
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const transaction = await walletService.spendCoins(userId, req.body);
    return successResponse(res, transaction, 'Coins spent successfully');
  });

  /**
   * Get transaction history
   * GET /api/v1/wallet/transactions
   */
  getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const type = req.query.type as TransactionType | undefined;
    const source = req.query.source as TransactionSource | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    // Validate query
    const validation = validateGetTransactions({ limit, offset, type, source, startDate, endDate });
    if (!validation.valid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const result = await walletService.getTransactions(userId, {
      limit,
      offset,
      type,
      source,
      startDate,
      endDate,
    });

    return successResponse(res, result, 'Transactions retrieved successfully');
  });

  /**
   * Claim daily reward
   * POST /api/v1/wallet/daily-reward
   */
  claimDailyReward = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await walletService.claimDailyReward(userId);
    if (!result.claimed) {
      return successResponse(
        res,
        result,
        `Daily reward already claimed. Next claim at ${result.nextClaimAt}`
      );
    }

    return successResponse(
      res,
      result,
      `Daily reward claimed successfully! ${result.amount} coins earned (Streak: ${result.streak})`
    );
  });

  /**
   * Get daily reward status
   * GET /api/v1/wallet/daily-reward/status
   */
  getDailyRewardStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const status = await walletService.getDailyRewardStatus(userId);
    return successResponse(res, status, 'Daily reward status retrieved successfully');
  });

  /**
   * Check if user has sufficient balance
   * POST /api/v1/wallet/check-balance
   */
  checkBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const hasSufficient = await walletService.hasSufficientBalance(userId, amount);
    return successResponse(
      res,
      { hasSufficient, amount },
      hasSufficient ? 'Sufficient balance' : 'Insufficient balance'
    );
  });
}

// Export singleton instance
export const walletController = new WalletController();
