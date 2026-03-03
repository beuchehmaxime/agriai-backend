import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from './service';
import type { Order } from './types';

export const useOrders = (search?: string) => {
    return useQuery<Order[]>({
        queryKey: ['orders', search],
        queryFn: () => ordersService.getOrders(search),
    });
};

export const useUpdateOrderStatus = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: Order['status'] }) => ordersService.updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useDeleteOrder = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ordersService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            if (onSuccess) onSuccess();
        }
    });
};
