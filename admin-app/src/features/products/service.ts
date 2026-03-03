import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { Product } from './types';

export const productsService = {
    getProducts: async (): Promise<Product[]> => {
        const response = await apiClient.get<ApiResponse<Product[]>>('/products');
        return response.data.data || [];
    },
    createProduct: async (data: FormData): Promise<Product> => {
        const response = await apiClient.post<ApiResponse<Product>>('/products', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data!;
    },
    updateProduct: async (id: string, data: FormData): Promise<Product> => {
        const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data!;
    },
    deleteProduct: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
    }
};
