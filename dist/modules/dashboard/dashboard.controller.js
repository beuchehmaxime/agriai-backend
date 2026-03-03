import { DashboardService } from './dashboard.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const dashboardService = new DashboardService();
export const getDashboardStats = async (req, res) => {
    try {
        const stats = await dashboardService.getStats();
        sendSuccess(res, 'Dashboard stats retrieved successfully', stats);
    }
    catch (error) {
        sendError(res, error, 500);
    }
};
