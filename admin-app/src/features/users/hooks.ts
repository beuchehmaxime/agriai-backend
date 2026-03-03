import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from './service';
import type { User } from './types';

export const useUsers = () => {
    return useQuery<User[]>({
        queryKey: ['users'],
        queryFn: usersService.getUsers,
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersService.updateUser>[1] }) =>
            usersService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUserPassword = () => {
    return useMutation({
        mutationFn: ({ id, password }: { id: string; password: string }) =>
            usersService.updatePassword(id, password),
    });
};
