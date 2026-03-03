import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from './service';
import type { Category } from './types';

export const useCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories,
    });
};

export const useCreateCategory = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: categoriesService.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useUpdateCategory = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: { name: string, description: string } }) => categoriesService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: categoriesService.deleteCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
    });
};
