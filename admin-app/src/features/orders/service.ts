import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { Order } from './types';

export const ordersService = {
    getOrders: async (search?: string): Promise<Order[]> => {
        const response = await apiClient.get<ApiResponse<Order[]>>('/orders', { params: { search } });
        return response.data.data || [];
    },
    updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
        const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
        return response.data.data!;
    },
    deleteOrder: async (id: string): Promise<void> => {
        await apiClient.delete<ApiResponse<void>>(`/orders/${id}`);
    }
};
