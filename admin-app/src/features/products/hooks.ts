import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from './service';
import type { Product } from './types';

export const useProducts = () => {
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: productsService.getProducts,
    });
};

export const useCreateProduct = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsService.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useUpdateProduct = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: FormData }) => productsService.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: productsService.deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
    });
};
