import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { DashboardStats } from './types';

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
        return response.data.data!;
    }
};
