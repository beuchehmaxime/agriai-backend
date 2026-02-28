import prisma from '../../shared/prisma/prisma.service.js';
import { Product, Prisma } from '@prisma/client';

export class ProductRepository {
    async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return prisma.product.create({ data });
    }

    async findAll(filters: { search?: string; categoryId?: string; disease?: string }): Promise<Product[]> {
        const where: Prisma.ProductWhereInput = {};

        if (filters.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters.disease) {
            where.diseaseTags = {
                has: filters.disease
            };
        }

        return prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });
    }

    async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data,
            include: { category: true }
        });
    }

    async delete(id: string): Promise<Product> {
        return prisma.product.delete({ where: { id } });
    }
}
