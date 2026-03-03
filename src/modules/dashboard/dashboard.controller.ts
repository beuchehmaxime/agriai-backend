import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';

const dashboardService = new DashboardService();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await dashboardService.getStats();
        sendSuccess(res, 'Dashboard stats retrieved successfully', stats);
    } catch (error: any) {
        sendError(res, error, 500);
    }
};
