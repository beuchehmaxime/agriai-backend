import prisma from '../../shared/prisma/prisma.service.js';
export class OrderRepository {
    async create(data) {
        return prisma.order.create({
            data,
            include: { items: { include: { product: true } } }
        });
    }
    async findAll() {
        return prisma.order.findMany({
            include: { items: { include: { product: true } }, user: { select: { name: true, phoneNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByUserId(userId) {
        return prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } }, user: { select: { name: true, phoneNumber: true } } }
        });
    }
    async updateStatus(id, status) {
        return prisma.order.update({
            where: { id },
            data: { status }
        });
    }
}
