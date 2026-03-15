import prisma from '../../shared/prisma/prisma.service.js';
export class SubscriptionPlanRepository {
    async create(data) {
        return prisma.subscriptionPlan.create({ data });
    }
    async findById(id) {
        return prisma.subscriptionPlan.findUnique({ where: { id } });
    }
    async findByAgronomistId(agronomistId) {
        return prisma.subscriptionPlan.findMany({
            where: { agronomistId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, data) {
        return prisma.subscriptionPlan.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma.subscriptionPlan.delete({
            where: { id }
        });
    }
}
