import prisma from '../../shared/prisma/prisma.service.js';
import { Diagnosis, Prisma } from '@prisma/client';

export class DiagnosisRepository {
    async create(data: Prisma.DiagnosisCreateInput): Promise<Diagnosis> {
        return prisma.diagnosis.create({ data });
    }

    async findById(id: string): Promise<Diagnosis | null> {
        return prisma.diagnosis.findUnique({ where: { id } });
    }

    async findByUserId(userId: string) {
        return prisma.diagnosis.findMany({
            where: { userId },
            include: { image: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteById(id: string): Promise<Diagnosis> {
        return prisma.diagnosis.delete({ where: { id } });
    }

    async deleteFeedbacksByDiagnosisId(diagnosisId: string): Promise<void> {
        await prisma.feedback.deleteMany({ where: { diagnosisId } });
    }
}
