import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipsService } from './service';
import type { Tip } from './types';

export const useTips = () => {
    return useQuery<Tip[]>({
        queryKey: ['tips'],
        queryFn: tipsService.getTips,
    });
};

export const useCreateTip = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tipsService.createTip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useUpdateTip = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: FormData }) => tipsService.updateTip(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
            if (onSuccess) onSuccess();
        }
    });
};

export const useUpdateTipStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => tipsService.updateTipStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tips'] });
        }
    });
};

export const useDeleteTip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tipsService.deleteTip,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tips'] })
    });
};
