import prisma from '../../shared/prisma/prisma.service.js';
import { Prisma, SubscriptionPlan } from '@prisma/client';

export class SubscriptionPlanRepository {
    async create(data: Prisma.SubscriptionPlanUncheckedCreateInput): Promise<SubscriptionPlan> {
        return prisma.subscriptionPlan.create({ data });
    }

    async findById(id: string): Promise<SubscriptionPlan | null> {
        return prisma.subscriptionPlan.findUnique({ where: { id } });
    }

    async findByAgronomistId(agronomistId: string): Promise<SubscriptionPlan[]> {
        return prisma.subscriptionPlan.findMany({
            where: { agronomistId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: string, data: Prisma.SubscriptionPlanUpdateInput): Promise<SubscriptionPlan> {
        return prisma.subscriptionPlan.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<SubscriptionPlan> {
        return prisma.subscriptionPlan.delete({
            where: { id }
        });
    }
}
