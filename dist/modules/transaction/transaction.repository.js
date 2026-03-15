import prisma from '../../shared/prisma/prisma.service.js';
export class TransactionRepository {
    async create(data) {
        return prisma.transaction.create({ data });
    }
    async findById(id) {
        return prisma.transaction.findUnique({ where: { id } });
    }
    async findByUserId(userId) {
        return prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateStatus(id, status) {
        return prisma.transaction.update({
            where: { id },
            data: { status }
        });
    }
}
