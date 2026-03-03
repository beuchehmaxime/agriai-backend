import prisma from '../../shared/prisma/prisma.service.js';
import { Order, OrderStatus, Prisma } from '@prisma/client';

export class OrderRepository {
    async create(data: Prisma.OrderCreateInput): Promise<Order> {
        return prisma.order.create({
            data,
            include: { items: { include: { product: true } } }
        });
    }

    async findAll(search?: string): Promise<Order[]> {
        const whereClause: Prisma.OrderWhereInput = search ? {
            OR: [
                { id: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } }
            ]
        } : {};

        return prisma.order.findMany({
            where: whereClause,
            include: { items: { include: { product: true } }, user: { select: { name: true, phoneNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findByUserId(userId: string): Promise<Order[]> {
        return prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string): Promise<Order | null> {
        return prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } }, user: { select: { name: true, phoneNumber: true } } }
        });
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        return prisma.order.update({
            where: { id },
            data: { status }
        });
    }

    async delete(id: string): Promise<Order> {
        return prisma.order.delete({
            where: { id }
        });
    }
}
