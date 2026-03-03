import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../shared/utils/middleware.utils.js';

const userService = new UserService();

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId || typeof userId !== 'string') {
            return sendError(res, 'User ID is required', 401);
        }

        const { name, email } = req.body;

        if (!name && !email) {
            return sendError(res, 'At least name or email must be provided to update', 400);
        }

        const updatedUser = await userService.updateProfile(userId, { name, email });

        const safeUser = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            userType: updatedUser.userType
        };

        sendSuccess(res, 'Profile updated successfully', { user: safeUser });
    } catch (error: any) {
        if (error.message.includes('Email is already in use')) {
            return sendError(res, error.message, 409);
        }
        sendError(res, error);
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        sendSuccess(res, 'All users retrieved successfully', users);
    } catch (error: any) {
        sendError(res, error, 500);
    }
};

export const updateUserAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id as string;
        if (!userId) {
            return sendError(res, 'User ID parameter is required', 400);
        }

        const { name, email, phoneNumber, userType } = req.body;

        const updatedUser = await userService.updateUserAdmin(userId, { name, email, phoneNumber, userType });

        // Return without password hash
        const { passwordHash, ...safeUser } = updatedUser;
        sendSuccess(res, 'User updated successfully', { user: safeUser });
    } catch (error: any) {
        if (error.message.includes('already in use')) {
            return sendError(res, error.message, 409);
        }
        sendError(res, error, 500);
    }
};

export const updateUserPasswordAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id as string;
        const { password } = req.body;

        if (!userId || !password) {
            return sendError(res, 'User ID parameter and password body are required', 400);
        }

        await userService.updateUserPasswordAdmin(userId, password);
        sendSuccess(res, 'User password updated successfully');
    } catch (error: any) {
        sendError(res, error, 500);
    }
};
