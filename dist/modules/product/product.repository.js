import prisma from '../../shared/prisma/prisma.service.js';
export class ProductRepository {
    async create(data) {
        return prisma.product.create({ data });
    }
    async findAll(filters) {
        const where = {};
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
    async findById(id) {
        return prisma.product.findUnique({
            where: { id },
            include: { category: true }
        });
    }
    async update(id, data) {
        return prisma.product.update({
            where: { id },
            data,
            include: { category: true }
        });
    }
    async delete(id) {
        return prisma.product.delete({ where: { id } });
    }
}
