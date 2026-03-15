import prisma from '../../shared/prisma/prisma.service.js';
import { SubscriptionRepository } from './subscription.repository.js';
import { TransactionRepository } from '../transaction/transaction.repository.js';
import { MockMomoService } from '../transaction/mock-momo.service.js';
import { PaymentProvider } from '@prisma/client';

export class SubscriptionService {
    private repository: SubscriptionRepository;
    private transactionRepo: TransactionRepository;
    private momoService: MockMomoService;

    constructor() {
        this.repository = new SubscriptionRepository();
        this.transactionRepo = new TransactionRepository();
        this.momoService = new MockMomoService();
    }

    async purchasePlan(farmerId: string, planId: string, quantity: number, phoneNumber: string, provider: PaymentProvider) {
        if (quantity < 1) throw new Error('Quantity must be at least 1');

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        });

        if (!plan) throw new Error('Subscription plan not found');

        const totalAmount = plan.price * quantity;
        const companyCut = totalAmount * 0.10; // 10%
        const agronomistCut = totalAmount - companyCut;

        console.log(totalAmount, companyCut, agronomistCut);
        // 1. Process payment via MOMO
        const momoResponse = await this.momoService.initiatePayment(phoneNumber, totalAmount, provider);

        if (!momoResponse.success) {
            // Log failed transaction
            await this.transactionRepo.create({
                userId: farmerId,
                amount: totalAmount,
                type: 'PAYMENT',
                provider,
                phoneNumber,
                reference: momoResponse.reference,
                companyCut,
                netAmount: agronomistCut,
                status: 'FAILED'
            });
            throw new Error(momoResponse.message || 'Payment failed');
        }

        // 2. Successful Payment - Start Database Transaction
        const transaction = await prisma.$transaction(async (tx) => {
            // A. Record the payment transaction
            const paymentTx = await tx.transaction.create({
                data: {
                    userId: farmerId,
                    amount: totalAmount,
                    type: 'PAYMENT',
                    provider,
                    phoneNumber,
                    reference: momoResponse.reference,
                    companyCut,
                    netAmount: agronomistCut,
                    status: 'SUCCESS'
                }
            });

            // B. Create the Subscription record
            const isUnlimited = plan.type === 'ONE_TIME';
            let hoursPurchased = null;

            if (plan.type === 'HOURLY') {
                // If plan defines a duration, multiply it. Otherwise, assume 1 hour per unit quantity.
                hoursPurchased = plan.durationHours ? plan.durationHours * quantity : quantity;
            }

            const subscription = await tx.subscription.create({
                data: {
                    farmerId,
                    planId: plan.id,
                    hoursPurchased,
                    isUnlimited,
                    status: 'SUCCESS'
                }
            });

            // C. Update Agronomist's Wallet
            await tx.user.update({
                where: { id: plan.agronomistId },
                data: {
                    walletBalance: { increment: agronomistCut }
                }
            });

            return { paymentTx, subscription };
        });

        return transaction.subscription;
    }

    async getMySubscriptions(farmerId: string) {
        return this.repository.findByFarmerId(farmerId);
    }

    async getSubscribers(agronomistId: string) {
        return this.repository.findSubscribers(agronomistId);
    }

    async deductHours(agronomistId: string, subscriptionId: string, hoursToDeduct: number) {
        if (hoursToDeduct <= 0) throw new Error('Hours to deduct must be greater than 0');

        const sub = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true }
        });

        if (!sub) throw new Error('Subscription not found');
        if (sub.plan.agronomistId !== agronomistId) throw new Error('Unauthorized to manage this subscription');

        if (sub.isUnlimited) {
            throw new Error('Cannot deduct hours from an unlimited subscription');
        }

        const currentAvailable = (sub.hoursPurchased || 0) - sub.hoursUsed;
        if (hoursToDeduct > currentAvailable) {
            throw new Error(`Cannot deduct ${hoursToDeduct} hours. Only ${currentAvailable} hours remaining.`);
        }

        return this.repository.deductHours(subscriptionId, hoursToDeduct);
    }
}
