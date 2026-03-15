import prisma from '../../shared/prisma/prisma.service.js';
import { Prisma, Transaction } from '@prisma/client';

export class TransactionRepository {
    async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
        return prisma.transaction.create({ data });
    }

    async findById(id: string): Promise<Transaction | null> {
        return prisma.transaction.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<Transaction[]> {
        return prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateStatus(id: string, status: 'PENDING' | 'SUCCESS' | 'FAILED'): Promise<Transaction> {
        return prisma.transaction.update({
            where: { id },
            data: { status }
        });
    }
}
