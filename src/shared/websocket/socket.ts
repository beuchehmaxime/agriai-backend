import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma.service.js';

export const initSocketServer = (server: HttpServer) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication error'));

            const secret = process.env.JWT_SECRET || 'secret';
            const decoded = jwt.verify(token, secret) as { userId: string };

            const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
            if (!user) return next(new Error('User not found'));

            socket.data.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket: Socket) => {
        const userId = socket.data.user.id;
        console.log(`User connected: ${userId}`);

        // Update online status
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true }
        });

        // Join personal room for direct messages
        socket.join(userId);

        // Notify others if an agronomist came online (optional but good feature)
        if (socket.data.user.userType === 'AGRONOMIST') {
            io.emit('agronomist_status_change', { agronomistId: userId, isOnline: true });
        }

        socket.on('send_message', async (data: { consultationId: string; text?: string; imageUrl?: string }) => {
            try {
                // Verify user is part of the consultation
                const consultation = await prisma.consultation.findUnique({
                    where: { id: data.consultationId }
                });

                if (!consultation) {
                    return socket.emit('error', { message: 'Consultation not found' });
                }

                if (consultation.farmerId !== userId && consultation.agronomistId !== userId) {
                    return socket.emit('error', { message: 'Access denied to this consultation' });
                }

                const recipientId = consultation.farmerId === userId ? consultation.agronomistId : consultation.farmerId;

                const message = await prisma.message.create({
                    data: {
                        consultationId: data.consultationId,
                        senderId: userId,
                        text: data.text,
                        imageUrl: data.imageUrl
                    },
                    include: { sender: { select: { id: true, name: true, userType: true } } }
                });

                // Emit to recipient
                io.to(recipientId).emit('receive_message', message);
                // Emit back to sender for confirmation
                socket.emit('message_sent', message);

            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('mark_read', async (data: { consultationId: string }) => {
            try {
                const consultation = await prisma.consultation.findUnique({
                    where: { id: data.consultationId }
                });

                if (!consultation) return;

                if (consultation.farmerId !== userId && consultation.agronomistId !== userId) {
                    return; // unauthorized
                }

                // Update messages from the other user
                await prisma.message.updateMany({
                    where: {
                        consultationId: data.consultationId,
                        senderId: { not: userId },
                        isRead: false
                    },
                    data: {
                        isRead: true,
                        readAt: new Date()
                    }
                });

                const recipientId = consultation.farmerId === userId ? consultation.agronomistId : consultation.farmerId;

                // Alert the other user that their messages were read
                io.to(recipientId).emit('messages_read', {
                    consultationId: data.consultationId,
                    readBy: userId,
                    readAt: new Date()
                });

            } catch (err) {
                console.error('Error marking messages as read:', err);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);
            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: false, lastActive: new Date() }
            });

            if (socket.data.user.userType === 'AGRONOMIST') {
                io.emit('agronomist_status_change', { agronomistId: userId, isOnline: false });
            }
        });
    });

    return io;
};
