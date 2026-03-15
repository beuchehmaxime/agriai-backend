import prisma from '../../shared/prisma/prisma.service.js';
export class SubscriptionRepository {
    async create(data) {
        return prisma.subscription.create({ data });
    }
    async findById(id) {
        return prisma.subscription.findUnique({
            where: { id },
            include: { plan: true }
        });
    }
    async findByFarmerId(farmerId) {
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
    async findSubscribers(agronomistId) {
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
    async deductHours(id, hours) {
        return prisma.subscription.update({
            where: { id },
            data: {
                hoursUsed: { increment: hours }
            }
        });
    }
    // useful to check if a farmer has an active subscription with an agronomist
    async findActiveSubscription(farmerId, agronomistId) {
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
