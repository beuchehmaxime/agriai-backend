import { Request, Response } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../types/auth-request.js';
import { PaymentProvider } from '@prisma/client';

const subscriptionService = new SubscriptionService();

export const purchaseSubscription = async (req: AuthRequest, res: Response) => {
    try {
        const farmerId = req.user?.id;
        if (!farmerId) return sendError(res, 'Unauthorized', 401);

        const { planId, quantity, phoneNumber, provider } = req.body;

        if (!planId || !quantity || !phoneNumber || !provider) {
            return sendError(res, 'planId, quantity, phoneNumber, and provider are required', 400);
        }

        if (!Object.values(PaymentProvider).includes(provider)) {
            return sendError(res, 'Invalid payment provider', 400);
        }
        console.log(farmerId, planId, quantity, phoneNumber, provider);
        const subscription = await subscriptionService.purchasePlan(
            farmerId,
            planId,
            Number(quantity),
            phoneNumber,
            provider as PaymentProvider
        );

        sendSuccess(res, 'Subscription purchased successfully', subscription, 201);
    } catch (error: any) {
        if (error.message.includes('failed')) return sendError(res, error.message, 400);
        sendError(res, error.message || error, 500);
    }
};


export const getMySubscriptions = async (req: AuthRequest, res: Response) => {
    try {
        const farmerId = req.user?.id;
        if (!farmerId) return sendError(res, 'Unauthorized', 401);

        const subscriptions = await subscriptionService.getMySubscriptions(farmerId);
        sendSuccess(res, 'Subscriptions retrieved', subscriptions);
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};


export const getSubscribersList = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        if (!agronomistId) return sendError(res, 'Unauthorized', 401);

        const subscribers = await subscriptionService.getSubscribers(agronomistId);
        sendSuccess(res, 'Subscribers retrieved', subscribers);
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};


export const deductHours = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        const { id } = req.params; // subscription ID
        let { hoursToDeduct } = req.body;

        if (!agronomistId) return sendError(res, 'Unauthorized', 401);
        
        hoursToDeduct = Number(hoursToDeduct);
        if (!hoursToDeduct || isNaN(hoursToDeduct)) {
            return sendError(res, 'Invalid hoursToDeduct', 400);
        }

        const updatedSubscription = await subscriptionService.deductHours(agronomistId, id, hoursToDeduct);
        sendSuccess(res, 'Hours successfully deducted', updatedSubscription);
    } catch (error: any) {
        if (error.message.includes('not found')) return sendError(res, error.message, 404);
        if (error.message.includes('Unauthorized')) return sendError(res, error.message, 403);
        if (error.message.includes('Cannot deduct')) return sendError(res, error.message, 400);

        sendError(res, error.message || error, 500);
    }
};
