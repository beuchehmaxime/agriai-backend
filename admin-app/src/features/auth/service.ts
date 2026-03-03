import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { AuthResponseData } from './types';

export const authService = {
    login: async (phoneNumber: string, password: string): Promise<ApiResponse<AuthResponseData>> => {
        const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', {
            phoneNumber,
            password,
        });
        return response.data;
    },
};
