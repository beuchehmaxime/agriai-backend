import prisma from '../../shared/prisma/prisma.service.js';
export class TipRepository {
    async create(data) {
        return prisma.tip.create({ data, include: { author: { select: { id: true, name: true, userType: true } }, _count: { select: { votes: { where: { isHelpful: true } } } } } });
    }
    async findAll(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.authorId) {
            where.authorId = filters.authorId;
        }
        return prisma.tip.findMany({
            where,
            include: {
                author: { select: { id: true, name: true, userType: true } },
                _count: { select: { votes: { where: { isHelpful: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return prisma.tip.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, userType: true } },
                _count: { select: { votes: { where: { isHelpful: true } } } }
            }
        });
    }
    async update(id, data) {
        return prisma.tip.update({
            where: { id },
            data,
            include: {
                author: { select: { id: true, name: true, userType: true } },
                _count: { select: { votes: { where: { isHelpful: true } } } }
            }
        });
    }
    async delete(id) {
        return prisma.tip.delete({ where: { id } });
    }
    async findVote(tipId, userId) {
        return prisma.tipVote.findUnique({
            where: {
                tipId_userId: {
                    tipId,
                    userId
                }
            }
        });
    }
    async createVote(data) {
        return prisma.tipVote.create({ data });
    }
    async updateVote(tipId, userId, isHelpful) {
        return prisma.tipVote.update({
            where: {
                tipId_userId: { tipId, userId }
            },
            data: { isHelpful }
        });
    }
}
