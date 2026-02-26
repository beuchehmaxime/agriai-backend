import prisma from '../../shared/prisma/prisma.service.js';
import { Feedback, Prisma } from '@prisma/client';

export class FeedbackRepository {
    async create(data: Prisma.FeedbackCreateInput): Promise<Feedback> {
        return prisma.feedback.create({ data });
    }
}
