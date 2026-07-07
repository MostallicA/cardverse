/**
 * Wallet - Service Layer
 * CV-MOD-008
 *
 * Implements business logic for wallet management including balance,
 * transactions, coin operations, and daily rewards.
 */

import {
  Wallet,
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionSource,
  AddCoinsRequest,
  SpendCoinsRequest,
  WalletResponse,
  TransactionResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  DailyRewardResponse,
} from './wallet.types';

// In-memory stores (will be replaced with PostgreSQL in production)
const wallets = new Map<string, Wallet>(); // userId -> Wallet
const transactions = new Map<string, Transaction[]>(); // userId -> Transaction[]
const dailyRewards = new Map<string, { lastClaim: Date; streak: number }>(); // userId -> daily reward info

// Helper to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Constants
const DAILY_REWARD_AMOUNT = 100;
const DAILY_REWARD_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class WalletService {
  /**
   * Get wallet for a user (create if not exists)
   */
  async getWallet(userId: string): Promise<WalletResponse> {
    let wallet = wallets.get(userId);
    if (!wallet) {
      wallet = this.createWallet(userId);
      wallets.set(userId, wallet);
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
    const wallet = await this.getWallet(userId);
    const balanceBefore = wallet.coins;

    // Update wallet
    wallet.coins += request.amount;
    wallet.totalEarned += request.amount;
    wallet.updatedAt = new Date();
    wallets.set(userId, wallet);

    // Create transaction
    const transaction: Transaction = {
      id: generateId(),
      userId,
      type: TransactionType.EARN,
      source: request.source,
      amount: request.amount,
      balanceBefore,
      balanceAfter: wallet.coins,
      status: TransactionStatus.COMPLETED,
      description: request.description,
      metadata: request.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveTransaction(userId, transaction);

    return this.toTransactionResponse(transaction);
  }

  /**
   * Spend coins from a user's wallet
   */
  async spendCoins(userId: string, request: SpendCoinsRequest): Promise<TransactionResponse> {
    const wallet = await this.getWallet(userId);

    // Check if sufficient balance
    if (wallet.coins < request.amount) {
      throw new Error(
        `Insufficient balance. Available: ${wallet.coins}, Required: ${request.amount}`
      );
    }

    const balanceBefore = wallet.coins;

    // Update wallet
    wallet.coins -= request.amount;
    wallet.totalSpent += request.amount;
    wallet.updatedAt = new Date();
    wallets.set(userId, wallet);

    // Create transaction
    const transaction: Transaction = {
      id: generateId(),
      userId,
      type: TransactionType.SPEND,
      source: request.source,
      amount: request.amount,
      balanceBefore,
      balanceAfter: wallet.coins,
      status: TransactionStatus.COMPLETED,
      description: request.description,
      metadata: request.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveTransaction(userId, transaction);

    return this.toTransactionResponse(transaction);
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(
    userId: string,
    request: GetTransactionsRequest
  ): Promise<GetTransactionsResponse> {
    const userTransactions = transactions.get(userId) || [];

    let filtered = userTransactions;

    // Filter by type
    if (request.type) {
      filtered = filtered.filter((t) => t.type === request.type);
    }

    // Filter by source
    if (request.source) {
      filtered = filtered.filter((t) => t.source === request.source);
    }

    // Filter by date range
    if (request.startDate) {
      filtered = filtered.filter((t) => t.createdAt >= request.startDate!);
    }
    if (request.endDate) {
      filtered = filtered.filter((t) => t.createdAt <= request.endDate!);
    }

    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const limit = request.limit || 20;
    const offset = request.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      transactions: paginated.map((t) => this.toTransactionResponse(t)),
      total,
      hasMore,
    };
  }

  /**
   * Claim daily reward for a user
   */
  async claimDailyReward(userId: string): Promise<DailyRewardResponse> {
    const now = new Date();
    const rewardInfo = dailyRewards.get(userId);

    // Check if already claimed today
    if (rewardInfo) {
      const lastClaim = rewardInfo.lastClaim;
      const timeSinceLastClaim = now.getTime() - lastClaim.getTime();

      if (timeSinceLastClaim < DAILY_REWARD_COOLDOWN) {
        const nextClaimAt = new Date(lastClaim.getTime() + DAILY_REWARD_COOLDOWN);
        return {
          claimed: false,
          nextClaimAt,
          amount: 0,
          streak: rewardInfo.streak,
        };
      }
    }

    // Calculate streak
    let streak = 1;
    if (rewardInfo) {
      const lastClaim = rewardInfo.lastClaim;
      const timeSinceLastClaim = now.getTime() - lastClaim.getTime();
      // If claimed within 48 hours, maintain streak
      if (timeSinceLastClaim < 48 * 60 * 60 * 1000) {
        streak = rewardInfo.streak + 1;
      }
    }

    // Update daily reward info
    dailyRewards.set(userId, {
      lastClaim: now,
      streak,
    });

    // Add coins
    const amount = DAILY_REWARD_AMOUNT + Math.min((streak - 1) * 10, 100); // Bonus up to 100 extra
    await this.addCoins(userId, {
      amount,
      source: TransactionSource.DAILY_REWARD,
      description: `Daily reward - Streak: ${streak}`,
      metadata: { streak },
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
    const rewardInfo = dailyRewards.get(userId);
    const now = new Date();

    if (!rewardInfo) {
      return {
        claimed: false,
        nextClaimAt: undefined,
        amount: DAILY_REWARD_AMOUNT,
        streak: 0,
      };
    }

    const timeSinceLastClaim = now.getTime() - rewardInfo.lastClaim.getTime();
    if (timeSinceLastClaim < DAILY_REWARD_COOLDOWN) {
      return {
        claimed: true,
        nextClaimAt: new Date(rewardInfo.lastClaim.getTime() + DAILY_REWARD_COOLDOWN),
        amount: DAILY_REWARD_AMOUNT + Math.min((rewardInfo.streak - 1) * 10, 100),
        streak: rewardInfo.streak,
      };
    }

    return {
      claimed: false,
      nextClaimAt: undefined,
      amount: DAILY_REWARD_AMOUNT,
      streak: rewardInfo.streak,
    };
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.getWallet(userId);
    return wallet.coins >= amount;
  }

  /**
   * Create a new wallet for a user
   */
  private createWallet(userId: string): Wallet {
    return {
      userId,
      coins: 0,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Save a transaction for a user
   */
  private saveTransaction(userId: string, transaction: Transaction): void {
    const userTransactions = transactions.get(userId) || [];
    userTransactions.push(transaction);
    transactions.set(userId, userTransactions);
  }

  /**
   * Convert Wallet to WalletResponse
   */
  private toResponse(wallet: Wallet): WalletResponse {
    return {
      userId: wallet.userId,
      coins: wallet.coins,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
    };
  }

  /**
   * Convert Transaction to TransactionResponse
   */
  private toTransactionResponse(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type,
      source: transaction.source,
      amount: transaction.amount,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      metadata: transaction.metadata,
      status: transaction.status,
      createdAt: transaction.createdAt,
    };
  }
}

// Export singleton instance
export const walletService = new WalletService();
