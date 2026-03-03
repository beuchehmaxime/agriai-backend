import { apiClient } from '../../api/axios';
import type { ApiResponse } from '../../types/api';
import type { User, UpdateUserDto } from './types';

export const usersService = {
    getUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<ApiResponse<User[]>>('/user/all');
        return response.data.data || [];
    },
    updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
        const response = await apiClient.put<ApiResponse<{ user: User }>>(`/user/${id}`, data);
        return response.data.data!.user;
    },
    updatePassword: async (id: string, password: string): Promise<void> => {
        await apiClient.put<ApiResponse<void>>(`/user/${id}/password`, { password });
    }
};
