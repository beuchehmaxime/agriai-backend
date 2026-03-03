import prisma from '../../shared/prisma/prisma.service.js';
export class FeedbackRepository {
    async create(data) {
        return prisma.feedback.create({ data });
    }
}
