import prisma from '../../shared/prisma/prisma.service.js';
export class MessageService {
    async getMessages(consultationId, userId, page = 1, limit = 50) {
        // Verify user is part of the consultation
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || (consultation.farmerId !== userId && consultation.agronomistId !== userId)) {
            throw new Error('Consultation not found or access denied');
        }
        const skip = (page - 1) * limit;
        const messages = await prisma.message.findMany({
            where: { consultationId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { sender: { select: { id: true, name: true, userType: true } } }
        });
        // We return them in descending order (newest first).
        // Mobile apps (like React Native FlatList with inverted={true})
        // expect the newest message at index 0 so that it renders at the absolute bottom.
        return messages;
    }
    async sendMessage(senderId, consultationId, text, imageUrl) {
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || (consultation.farmerId !== senderId && consultation.agronomistId !== senderId)) {
            throw new Error('Consultation not found or access denied');
        }
        const message = await prisma.message.create({
            data: {
                consultationId,
                senderId,
                text,
                imageUrl
            },
            include: { sender: { select: { id: true, name: true, userType: true } } }
        });
        // Update consultation's updatedAt so it bubbles to the top of the chat list
        await prisma.consultation.update({
            where: { id: consultationId },
            data: { updatedAt: new Date() }
        });
        return message;
    }
    async markMessagesAsRead(consultationId, userId) {
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || (consultation.farmerId !== userId && consultation.agronomistId !== userId)) {
            throw new Error('Consultation not found or access denied');
        }
        // We want to mark messages sent by the OTHER person as read
        const updateResult = await prisma.message.updateMany({
            where: {
                consultationId,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        return updateResult.count;
    }
}
