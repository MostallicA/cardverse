/**
 * Wallet - Routes Layer
 * CV-MOD-008
 *
 * Defines API routes for wallet management including balance,
 * transactions, coin operations, and daily rewards.
 */

import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';

import { walletController } from './wallet.controller.js';

const router: Router = Router();

// All wallet routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/wallet
 * @desc    Get wallet for current user
 * @access  Private
 */
router.get('/', walletController.getWallet);

/**
 * @route   GET /api/v1/wallet/balance
 * @desc    Get balance for current user
 * @access  Private
 */
router.get('/balance', walletController.getBalance);

/**
 * @route   POST /api/v1/wallet/add
 * @desc    Add coins to wallet (admin or system)
 * @access  Private
 */
router.post('/add', walletController.addCoins);

/**
 * @route   POST /api/v1/wallet/spend
 * @desc    Spend coins from wallet
 * @access  Private
 */
router.post('/spend', walletController.spendCoins);

/**
 * @route   GET /api/v1/wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/transactions', walletController.getTransactions);

/**
 * @route   POST /api/v1/wallet/daily-reward
 * @desc    Claim daily reward
 * @access  Private
 */
router.post('/daily-reward', walletController.claimDailyReward);

/**
 * @route   GET /api/v1/wallet/daily-reward/status
 * @desc    Get daily reward status
 * @access  Private
 */
router.get('/daily-reward/status', walletController.getDailyRewardStatus);

/**
 * @route   POST /api/v1/wallet/check-balance
 * @desc    Check if user has sufficient balance
 * @access  Private
 */
router.post('/check-balance', walletController.checkBalance);

export default router;
