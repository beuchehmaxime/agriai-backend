import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { ExpertApplication } from './types';

export const applicationsService = {
    getApplications: async (): Promise<ExpertApplication[]> => {
        const response = await apiClient.get<ApiResponse<ExpertApplication[]>>('/expert-application');
        return response.data.data || [];
    },
    updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
        await apiClient.patch<ApiResponse<void>>(`/expert-application/${id}/status`, { status });
    }
};
