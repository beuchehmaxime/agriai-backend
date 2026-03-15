import prisma from '../../shared/prisma/prisma.service.js';
import { TransactionRepository } from './transaction.repository.js';
import { MockMomoService } from './mock-momo.service.js';
import { PaymentProvider } from '@prisma/client';

export class TransactionService {
    private repository: TransactionRepository;
    private momoService: MockMomoService;

    constructor() {
        this.repository = new TransactionRepository();
        this.momoService = new MockMomoService();
    }

    async getWalletBalance(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { walletBalance: true }
        });

        if (!user) throw new Error('User not found');

        return user.walletBalance;
    }

    async getTransactionHistory(userId: string) {
        return this.repository.findByUserId(userId);
    }

    async requestWithdrawal(userId: string, amount: number, phoneNumber: string, provider: PaymentProvider) {
        if (amount < 100) {
            throw new Error('Minimum withdrawal amount is 100');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error('User not found');

        if (user.walletBalance < amount) {
            throw new Error('Insufficient wallet balance');
        }

        // 1. Process via Momo
        const momoResponse = await this.momoService.processWithdrawal(phoneNumber, amount, provider);

        // 2. Record Transaction
        const transaction = await this.repository.create({
            userId,
            amount: amount, // Positive or negative? Usually recorded as positive
            currency: 'XAF',
            type: 'WITHDRAWAL',
            provider,
            phoneNumber,
            reference: momoResponse.reference,
            companyCut: 0,
            netAmount: amount, // They withdraw the net amount
            status: momoResponse.success ? 'SUCCESS' : 'FAILED',
        });

        if (!momoResponse.success) {
            throw new Error(momoResponse.message || 'Withdrawal failed');
        }

        // 3. Deduct from wallet
        await prisma.user.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    decrement: amount
                }
            }
        });

        return transaction;
    }
}
