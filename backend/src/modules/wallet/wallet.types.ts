/**
 * Wallet - Type Definitions
 * CV-MOD-008
 *
 * Defines types and interfaces for wallet management including
 * balance, transactions, and coin operations.
 */

/* eslint-disable no-unused-vars */
export enum TransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  REFUND = 'refund',
  BONUS = 'bonus',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionSource {
  DAILY_REWARD = 'daily_reward',
  MATCH_WIN = 'match_win',
  SHOP_PURCHASE = 'shop_purchase',
  ACHIEVEMENT = 'achievement',
  MISSION = 'mission',
  SEASON_REWARD = 'season_reward',
  REFUND = 'refund',
  ADMIN = 'admin',
  BONUS = 'bonus',
}
/* eslint-enable no-unused-vars */

export interface Wallet {
  userId: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddCoinsRequest {
  amount: number;
  source: TransactionSource;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SpendCoinsRequest {
  amount: number;
  source: TransactionSource;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletResponse {
  userId: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  metadata?: Record<string, unknown>;
  status: TransactionStatus;
  createdAt: Date;
}

export interface GetTransactionsRequest {
  limit?: number;
  offset?: number;
  type?: TransactionType;
  source?: TransactionSource;
  startDate?: Date;
  endDate?: Date;
}

export interface GetTransactionsResponse {
  transactions: TransactionResponse[];
  total: number;
  hasMore: boolean;
}

export interface DailyRewardResponse {
  claimed: boolean;
  nextClaimAt?: Date;
  amount: number;
  streak: number;
}
