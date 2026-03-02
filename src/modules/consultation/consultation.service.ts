import prisma from '../../shared/prisma/prisma.service.js';

export class ConsultationService {
    async getAgronomists(userId: string) {
        // Find all agronomists this farmer has ever connected with
        const existingConsultations = await prisma.consultation.findMany({
            where: { farmerId: userId },
            select: { agronomistId: true }
        });

        const connectedAgronomistIds = existingConsultations.map(c => c.agronomistId);

        return await prisma.user.findMany({
            where: {
                userType: 'AGRONOMIST',
                id: { notIn: connectedAgronomistIds }
            },
            select: { id: true, name: true, isOnline: true, lastActive: true, email: true },
            orderBy: [{ isOnline: 'desc' }, { lastActive: 'desc' }]
        });
    }

    async getConsultations(userId: string) {
        const consultations = await prisma.consultation.findMany({
            where: {
                OR: [
                    { farmerId: userId },
                    { agronomistId: userId }
                ]
            },
            include: {
                farmer: { select: { id: true, name: true, userType: true, isOnline: true } },
                agronomist: { select: { id: true, name: true, userType: true, isOnline: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format to easily present the "other user" to the frontend
        return consultations.map(c => {
            const isFarmer = c.farmerId === userId;
            const otherUser = isFarmer ? c.agronomist : c.farmer;
            const lastMessage = c.messages.length > 0 ? c.messages[0] : null;

            return {
                id: c.id,
                status: c.status,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                otherUser,
                agronomistName: c.agronomist.name,
                farmerName: c.farmer.name,
                agronomist: c.agronomist,
                farmer: c.farmer,
                lastMessage
            };
        });
    }

    async createConsultation(farmerId: string, agronomistId: string) {
        const agronomist = await prisma.user.findUnique({ where: { id: agronomistId } });
        if (!agronomist || agronomist.userType !== 'AGRONOMIST') {
            throw new Error('Agronomist not found or invalid');
        }

        const existing = await prisma.consultation.findFirst({
            where: { farmerId, agronomistId, status: 'ACTIVE' }
        });

        if (existing) return existing;

        return await prisma.consultation.create({
            data: { farmerId, agronomistId }
        });
    }

}
