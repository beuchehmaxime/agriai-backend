import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { Tip } from './types';

export const tipsService = {
    getTips: async (): Promise<Tip[]> => {
        const response = await apiClient.get<ApiResponse<Tip[]>>('/tips');
        return response.data.data || [];
    },
    createTip: async (data: FormData): Promise<Tip> => {
        const response = await apiClient.post<ApiResponse<Tip>>('/tips', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data!;
    },
    updateTip: async (id: string, data: FormData): Promise<Tip> => {
        const response = await apiClient.put<ApiResponse<Tip>>(`/tips/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data!;
    },
    updateTipStatus: async (id: string, status: string): Promise<void> => {
        await apiClient.put<ApiResponse<void>>(`/tips/${id}/status`, { status });
    },
    deleteTip: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/tips/${id}`);
    }
};
