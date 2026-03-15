import { Request, Response } from 'express';
import { SubscriptionPlanService } from './subscription-plan.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../types/auth-request.js';

const subscriptionPlanService = new SubscriptionPlanService();

export const createPlan = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        if (!agronomistId) return sendError(res, 'Unauthorized', 401);

        const { type, price, title, description, durationHours } = req.body;
        if (!type || !price || !title) return sendError(res, 'Type, price, and title are required', 400);

        const plan = await subscriptionPlanService.createPlan({
            agronomistId,
            type,
            price: Number(price),
            title,
            description,
            durationHours: durationHours ? Number(durationHours) : undefined
        });

        sendSuccess(res, 'Subscription plan created successfully', plan, 201);
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};

export const getMyPlans = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        if (!agronomistId) return sendError(res, 'Unauthorized', 401);

        const plans = await subscriptionPlanService.getPlansByAgronomist(agronomistId);
        sendSuccess(res, 'Plans retrieved successfully', plans);
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};

export const getAgronomistPlans = async (req: Request, res: Response) => {
    try {
        const { agronomistId } = req.params;
        const plans = await subscriptionPlanService.getPlansByAgronomist(agronomistId);
        sendSuccess(res, 'Agronomist plans retrieved successfully', plans);
    } catch (error: any) {
        sendError(res, error.message || error, 500);
    }
};

export const updatePlan = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        const { id } = req.params;
        if (!agronomistId) return sendError(res, 'Unauthorized', 401);

        const plan = await subscriptionPlanService.updatePlan(id, agronomistId, req.body);
        sendSuccess(res, 'Plan updated successfully', plan);
    } catch (error: any) {
        if (error.message.includes('not found')) return sendError(res, error.message, 404);
        if (error.message.includes('Unauthorized')) return sendError(res, error.message, 403);
        sendError(res, error.message || error, 500);
    }
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
    try {
        const agronomistId = req.user?.id;
        const { id } = req.params;
        if (!agronomistId) return sendError(res, 'Unauthorized', 401);

        await subscriptionPlanService.deletePlan(id, agronomistId);
        sendSuccess(res, 'Plan deleted successfully');
    } catch (error: any) {
        if (error.message.includes('not found')) return sendError(res, error.message, 404);
        if (error.message.includes('Unauthorized')) return sendError(res, error.message, 403);
        sendError(res, error.message || error, 500);
    }
};
