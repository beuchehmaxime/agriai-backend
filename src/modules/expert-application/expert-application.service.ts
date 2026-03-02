import { ApplicationStatus } from '@prisma/client';
import prisma from '../../shared/prisma/prisma.service.js';

export class ExpertApplicationService {
    async submitApplication(userId: string, experience: string, qualifications: string, certificateType: string, obtainedYear: string, institution: string, certificateUrl: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { expertApplications: true }
        });

        if (!user) throw new Error('User not found');
        if (user.userType === 'AGRONOMIST') throw new Error('User is already an agronomist');

        const rejectedCount = user.expertApplications.filter(app => app.status === 'REJECTED').length;
        const pendingCount = user.expertApplications.filter(app => app.status === 'PENDING').length;

        if (pendingCount > 0) throw new Error('You already have a pending application');
        if (rejectedCount >= 4) throw new Error('Maximum application limit (4) reached');

        return await prisma.expertApplication.create({
            data: {
                userId,
                experience,
                qualifications,
                certificateType,
                obtainedYear,
                institution,
                certificateUrl
            }
        });
    }

    async getApplications() {
        return await prisma.expertApplication.findMany({
            include: { user: { select: { name: true, email: true, phoneNumber: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateApplicationStatus(id: string, status: ApplicationStatus) {
        const application = await prisma.expertApplication.findUnique({ where: { id } });
        if (!application) throw new Error('Application not found');

        const updatedApp = await prisma.expertApplication.update({
            where: { id },
            data: { status }
        });

        if (status === 'APPROVED') {
            await prisma.user.update({
                where: { id: application.userId },
                data: { userType: 'AGRONOMIST' }
            });
        }

        return updatedApp;
    }
}
