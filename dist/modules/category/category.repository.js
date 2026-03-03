import prisma from '../../shared/prisma/prisma.service.js';
export class CategoryRepository {
    async create(data) {
        return prisma.category.create({ data });
    }
    async findAll() {
        return prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
    }
    async findById(id) {
        return prisma.category.findUnique({ where: { id } });
    }
    async findByName(name) {
        return prisma.category.findUnique({ where: { name } });
    }
    async update(id, data) {
        return prisma.category.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma.category.delete({ where: { id } });
    }
}
