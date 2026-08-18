/**
 * Wallet - Service Layer
 * CV-MOD-008
 *
 * Implements business logic for wallet management including balance,
 * transactions, coin operations, and daily rewards.
 * Now uses Prisma for persistence.
 */

import { prisma } from '../../db/prisma.js';

import {
  AddCoinsRequest,
  SpendCoinsRequest,
  WalletResponse,
  TransactionResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  DailyRewardResponse,
  TransactionType,
  TransactionStatus,
  TransactionSource,
} from './wallet.types.js';

// Constants
const DAILY_REWARD_AMOUNT = 100;
const DAILY_REWARD_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class WalletService {
  /**
   * Get wallet for a user (create if not exists)
   */
  async getWallet(userId: string): Promise<WalletResponse> {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          coins: 0,
          gems: 0,
          dailyStreak: 0,
        },
      });
    }

    return this.toResponse(wallet);
  }

  /**
   * Get balance for a user
   */
  async getBalance(userId: string): Promise<{ coins: number }> {
    const wallet = await this.getWallet(userId);
    return { coins: wallet.coins };
  }

  /**
   * Add coins to a user's wallet
   */
  async addCoins(userId: string, request: AddCoinsRequest): Promise<TransactionResponse> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balanceBefore = wallet.coins;
    const balanceAfter = wallet.coins + request.amount;

    // Update wallet using transaction to ensure consistency
    const updatedWallet = await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { userId },
        data: {
          coins: { increment: request.amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: updated.id,
          amount: request.amount,
          type: TransactionType.EARN,
          source: request.source as TransactionSource,
          description: request.description || 'Coins added',
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          metadata: (request.metadata as any) || {},
        },
      });

      return updated;
    });

    // Get the created transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        walletId: updatedWallet.id,
        type: TransactionType.EARN,
        amount: request.amount,
        balanceAfter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found after creation');
    }

    return this.toTransactionResponse(transaction);
  }

  /**
   * Spend coins from a user's wallet
   */
  async spendCoins(userId: string, request: SpendCoinsRequest): Promise<TransactionResponse> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check if sufficient balance
    if (wallet.coins < request.amount) {
      throw new Error(
        `Insufficient balance. Available: ${wallet.coins}, Required: ${request.amount}`
      );
    }

    const balanceBefore = wallet.coins;
    const balanceAfter = wallet.coins - request.amount;

    // Update wallet using transaction to ensure consistency
    const updatedWallet = await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { userId },
        data: {
          coins: { decrement: request.amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: updated.id,
          amount: request.amount,
          type: TransactionType.SPEND,
          source: request.source as TransactionSource,
          description: request.description || 'Coins spent',
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          metadata: (request.metadata as any) || {},
        },
      });

      return updated;
    });

    // Get the created transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        walletId: updatedWallet.id,
        type: TransactionType.SPEND,
        amount: request.amount,
        balanceAfter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found after creation');
    }

    return this.toTransactionResponse(transaction);
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(
    userId: string,
    request: GetTransactionsRequest
  ): Promise<GetTransactionsResponse> {
    // Get wallet first
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        transactions: [],
        total: 0,
        hasMore: false,
      };
    }

    // Build where clause
    const where: any = {
      walletId: wallet.id,
    };

    if (request.type) {
      where.type = request.type;
    }

    if (request.source) {
      where.source = request.source;
    }

    if (request.startDate) {
      where.createdAt = { gte: request.startDate };
    }

    if (request.endDate) {
      where.createdAt = { ...where.createdAt, lte: request.endDate };
    }

    const limit = request.limit || 20;
    const offset = request.offset || 0;

    // Get total count
    const total = await prisma.transaction.count({ where });

    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = offset + limit < total;

    return {
      transactions: transactions.map((t) => this.toTransactionResponse(t)),
      total,
      hasMore,
    };
  }

  /**
   * Claim daily reward for a user
   */
  async claimDailyReward(userId: string): Promise<DailyRewardResponse> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const now = new Date();

    // Check if already claimed today
    if (wallet.lastDailyClaim) {
      const timeSinceLastClaim = now.getTime() - wallet.lastDailyClaim.getTime();
      if (timeSinceLastClaim < DAILY_REWARD_COOLDOWN) {
        const nextClaimAt = new Date(wallet.lastDailyClaim.getTime() + DAILY_REWARD_COOLDOWN);
        return {
          claimed: false,
          nextClaimAt,
          amount: 0,
          streak: wallet.dailyStreak,
        };
      }
    }

    // Calculate streak
    let streak = 1;
    if (wallet.lastDailyClaim) {
      const timeSinceLastClaim = now.getTime() - wallet.lastDailyClaim.getTime();
      // If claimed within 48 hours, maintain streak
      if (timeSinceLastClaim < 48 * 60 * 60 * 1000) {
        streak = wallet.dailyStreak + 1;
      }
    }

    // Calculate reward amount
    const amount = DAILY_REWARD_AMOUNT + Math.min((streak - 1) * 10, 100);

    // Update wallet with daily reward info
    await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { userId },
        data: {
          coins: { increment: amount },
          lastDailyClaim: now,
          dailyStreak: streak,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: updated.id,
          amount,
          type: TransactionType.EARN,
          source: TransactionSource.DAILY_REWARD,
          description: `Daily reward - Streak: ${streak}`,
          balanceBefore: wallet.coins,
          balanceAfter: wallet.coins + amount,
          status: TransactionStatus.COMPLETED,
          metadata: { streak },
        },
      });
    });

    return {
      claimed: true,
      nextClaimAt: new Date(now.getTime() + DAILY_REWARD_COOLDOWN),
      amount,
      streak,
    };
  }

  /**
   * Get daily reward status for a user
   */
  async getDailyRewardStatus(userId: string): Promise<DailyRewardResponse> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        claimed: false,
        nextClaimAt: undefined,
        amount: DAILY_REWARD_AMOUNT,
        streak: 0,
      };
    }

    const now = new Date();

    if (wallet.lastDailyClaim) {
      const timeSinceLastClaim = now.getTime() - wallet.lastDailyClaim.getTime();
      if (timeSinceLastClaim < DAILY_REWARD_COOLDOWN) {
        const amount = DAILY_REWARD_AMOUNT + Math.min((wallet.dailyStreak - 1) * 10, 100);
        return {
          claimed: true,
          nextClaimAt: new Date(wallet.lastDailyClaim.getTime() + DAILY_REWARD_COOLDOWN),
          amount,
          streak: wallet.dailyStreak,
        };
      }
    }

    return {
      claimed: false,
      nextClaimAt: undefined,
      amount: DAILY_REWARD_AMOUNT,
      streak: wallet.dailyStreak || 0,
    };
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return false;
    }

    return wallet.coins >= amount;
  }

  /**
   * Convert Prisma Wallet to WalletResponse
   */
  private toResponse(wallet: any): WalletResponse {
    return {
      userId: wallet.userId,
      coins: wallet.coins,
      totalEarned: 0, // Will be calculated from transactions
      totalSpent: 0, // Will be calculated from transactions
    };
  }

  /**
   * Convert Prisma Transaction to TransactionResponse
   */
  private toTransactionResponse(transaction: any): TransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type as TransactionType,
      source: transaction.source as TransactionSource,
      amount: transaction.amount,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      metadata: transaction.metadata || {},
      status: transaction.status as TransactionStatus,
      createdAt: transaction.createdAt,
    };
  }
}

// Export singleton instance
export const walletService = new WalletService();
