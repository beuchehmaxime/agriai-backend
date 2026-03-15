import { TransactionService } from './transaction.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { PaymentProvider } from '@prisma/client';
const transactionService = new TransactionService();
export const getWallet = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return sendError(res, 'Unauthorized', 401);
        const balance = await transactionService.getWalletBalance(userId);
        const history = await transactionService.getTransactionHistory(userId);
        sendSuccess(res, 'Wallet details retrieved', { balance, history });
    }
    catch (error) {
        sendError(res, error.message || error, 500);
    }
};
export const withdraw = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return sendError(res, 'Unauthorized', 401);
        const { amount, phoneNumber, provider } = req.body;
        if (!amount || !phoneNumber || !provider) {
            return sendError(res, 'Amount, phoneNumber, and provider are required', 400);
        }
        if (!Object.values(PaymentProvider).includes(provider)) {
            return sendError(res, 'Invalid payment provider', 400);
        }
        const transaction = await transactionService.requestWithdrawal(userId, Number(amount), phoneNumber, provider);
        sendSuccess(res, 'Withdrawal successful', transaction, 201);
    }
    catch (error) {
        if (error.message.includes('Insufficient')) {
            return sendError(res, error.message, 400);
        }
        sendError(res, error.message || error, 500);
    }
};
