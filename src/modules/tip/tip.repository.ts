import prisma from '../../shared/prisma/prisma.service.js';
import { Tip, TipVote, Prisma, TipStatus } from '@prisma/client';

export class TipRepository {
    async create(data: Prisma.TipCreateInput): Promise<Tip> {
        return prisma.tip.create({ data, include: { author: { select: { id: true, name: true, userType: true } }, _count: { select: { votes: { where: { isHelpful: true } } } } } });
    }

    async findAll(filters: { status?: TipStatus, authorId?: string }): Promise<any[]> {
        const where: Prisma.TipWhereInput = {};

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

    async findById(id: string): Promise<any | null> {
        return prisma.tip.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, userType: true } },
                _count: { select: { votes: { where: { isHelpful: true } } } }
            }
        });
    }

    async update(id: string, data: Prisma.TipUpdateInput): Promise<Tip> {
        return prisma.tip.update({
            where: { id },
            data,
            include: {
                author: { select: { id: true, name: true, userType: true } },
                _count: { select: { votes: { where: { isHelpful: true } } } }
            }
        });
    }

    async delete(id: string): Promise<Tip> {
        return prisma.tip.delete({ where: { id } });
    }

    async findVote(tipId: string, userId: string): Promise<TipVote | null> {
        return prisma.tipVote.findUnique({
            where: {
                tipId_userId: {
                    tipId,
                    userId
                }
            }
        });
    }

    async createVote(data: Prisma.TipVoteUncheckedCreateInput): Promise<TipVote> {
        return prisma.tipVote.create({ data });
    }

    async updateVote(tipId: string, userId: string, isHelpful: boolean): Promise<TipVote> {
        return prisma.tipVote.update({
            where: {
                tipId_userId: { tipId, userId }
            },
            data: { isHelpful }
        });
    }
}
