import prisma from '../../shared/prisma/prisma.service.js';
import { Diagnosis, Prisma } from '@prisma/client';

export class DiagnosisRepository {
    async create(data: Prisma.DiagnosisCreateInput): Promise<Diagnosis> {
        return prisma.diagnosis.create({ data });
    }

    async findById(id: string): Promise<Diagnosis | null> {
        return prisma.diagnosis.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<Diagnosis[]> {
        return prisma.diagnosis.findMany({ where: { userId } });
    }
}
