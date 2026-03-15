import prisma from '../../shared/prisma/prisma.service.js';
import { Prisma, Subscription } from '@prisma/client';

export class SubscriptionRepository {
    async create(data: Prisma.SubscriptionUncheckedCreateInput): Promise<Subscription> {
        return prisma.subscription.create({ data });
    }

    async findById(id: string): Promise<Subscription | null> {
        return prisma.subscription.findUnique({
            where: { id },
            include: { plan: true }
        });
    }

    async findByFarmerId(farmerId: string): Promise<any[]> {
        return prisma.subscription.findMany({
            where: { farmerId },
            include: {
                plan: {
                    include: { agronomist: { select: { id: true, name: true, email: true, phoneNumber: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findSubscribers(agronomistId: string): Promise<any[]> {
        return prisma.subscription.findMany({
            where: {
                plan: { agronomistId }
            },
            include: {
                farmer: { select: { id: true, name: true, email: true, phoneNumber: true } },
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deductHours(id: string, hours: number): Promise<Subscription> {
        return prisma.subscription.update({
            where: { id },
            data: {
                hoursUsed: { increment: hours }
            }
        });
    }

    // useful to check if a farmer has an active subscription with an agronomist
    async findActiveSubscription(farmerId: string, agronomistId: string): Promise<Subscription | null> {
        const subscriptions = await prisma.subscription.findMany({
            where: {
                farmerId,
                plan: { agronomistId },
                status: 'SUCCESS'
            },
            include: { plan: true }
        });

        // Try to return an unlimited one first, or one with remaining hours
        return subscriptions.find(sub => sub.isUnlimited || ((sub.hoursPurchased || 0) > sub.hoursUsed)) || null;
    }
}
