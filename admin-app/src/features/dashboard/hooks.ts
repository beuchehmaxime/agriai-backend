import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './service';
import type { DashboardStats } from './types';

export const useDashboardStats = () => {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard_stats'],
        queryFn: dashboardService.getStats,
    });
};
