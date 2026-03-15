import { Request, Response } from 'express';
import { TransactionService } from './transaction.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../types/auth-request.js';
import { PaymentProvider } from '@prisma/client';

const transactionService = new TransactionService();

export const getWallet = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return sendError(res, 'Unauthorized', 401);

        const balance = await transactionService.getWalletBalance(userId);
        const history = await transactionService.getTransactionHistory(userId);

        sendSuccess(res, 'Wallet details retrieved', { balance, history });
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};


export const withdraw = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return sendError(res, 'Unauthorized', 401);

        const { amount, phoneNumber, provider } = req.body;

        if (!amount || !phoneNumber || !provider) {
            return sendError(res, 'Amount, phoneNumber, and provider are required', 400);
        }

        if (!Object.values(PaymentProvider).includes(provider)) {
            return sendError(res, 'Invalid payment provider', 400);
        }

        const transaction = await transactionService.requestWithdrawal(userId, Number(amount), phoneNumber, provider as PaymentProvider);

        sendSuccess(res, 'Withdrawal successful', transaction, 201);
    } catch (error: any) {
        if (error.message.includes('Insufficient')) {
            return sendError(res, error.message, 400);
        }
        sendError(res, error.message || error, 500);
    }
};
