import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from './service';
import type { ExpertApplication } from './types';

export const useApplications = () => {
    return useQuery<ExpertApplication[]>({
        queryKey: ['applications'],
        queryFn: applicationsService.getApplications,
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => applicationsService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
};
