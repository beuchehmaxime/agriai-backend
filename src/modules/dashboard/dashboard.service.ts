import prisma from '../../shared/prisma/prisma.service.js';

export class DashboardService {
    public async getStats() {
        // Fetch all counts in parallel for performance
        const [totalUsers, totalProducts, totalOrders, totalTips] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.tip.count()
        ]);

        return {
            totalUsers,
            totalProducts,
            totalOrders,
            totalTips
        };
    }
}
