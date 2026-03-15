import { SubscriptionRepository } from './subscription.repository.js';
import { sendError } from '../../shared/utils/response.utils.js';
import prisma from '../../shared/prisma/prisma.service.js';
const subscriptionRepo = new SubscriptionRepository();
export const requireActiveSubscriptionForConsultation = async (req, res, next) => {
    try {
        const farmerId = req.user?.id;
        const { agronomistId } = req.body;
        // If not a farmer or no agronomist ID is provided, bypass or let the controller handle validation.
        // It's technically verifying a farmer creating a consultation.
        if (!farmerId || req.user?.userType !== 'FARMER' || !agronomistId) {
            return next();
        }
        const activeSub = await subscriptionRepo.findActiveSubscription(farmerId, agronomistId);
        if (!activeSub) {
            return sendError(res, 'You must have an active subscription with this agronomist to start a consultation.', 403);
        }
        next();
    }
    catch (error) {
        sendError(res, 'Error verifying subscription status', 500);
    }
};
export const requireActiveSubscriptionForMessage = async (req, res, next) => {
    try {
        const senderId = req.user?.id;
        const consultationId = req.params.consultationId;
        // If the sender is an AGRONOMIST, they don't need a subscription to reply.
        if (!senderId || req.user?.userType !== 'FARMER' || !consultationId) {
            return next();
        }
        // Find the consultation to determine the agronomist
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId }
        });
        if (!consultation || consultation.farmerId !== senderId) {
            // Let the controller handle 404s and unauthorized accesses
            return next();
        }
        const activeSub = await subscriptionRepo.findActiveSubscription(senderId, consultation.agronomistId);
        if (!activeSub) {
            return sendError(res, 'Your subscription hours have run out. Please purchase a new plan to continue messaging.', 403);
        }
        next();
    }
    catch (error) {
        sendError(res, 'Error verifying subscription status', 500);
    }
};
