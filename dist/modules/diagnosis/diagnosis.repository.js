import prisma from '../../shared/prisma/prisma.service.js';
export class DiagnosisRepository {
    async create(data) {
        return prisma.diagnosis.create({ data });
    }
    async findById(id) {
        return prisma.diagnosis.findUnique({ where: { id } });
    }
    async findByUserId(userId) {
        return prisma.diagnosis.findMany({
            where: { userId },
            include: { image: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async deleteById(id) {
        return prisma.diagnosis.delete({ where: { id } });
    }
    async deleteFeedbacksByDiagnosisId(diagnosisId) {
        await prisma.feedback.deleteMany({ where: { diagnosisId } });
    }
}
