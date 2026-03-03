import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { Category } from './types';

export const categoriesService = {
    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
        return response.data.data || [];
    },
    createCategory: async (data: { name: string; description: string }): Promise<Category> => {
        const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
        return response.data.data!;
    },
    updateCategory: async (id: string, data: { name: string; description: string }): Promise<Category> => {
        const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
        return response.data.data!;
    },
    deleteCategory: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
    }
};
