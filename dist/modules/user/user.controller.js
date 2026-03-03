import { UserService } from './user.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const userService = new UserService();
export const updateProfile = async (req, res) => {
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
    }
    catch (error) {
        if (error.message.includes('Email is already in use')) {
            return sendError(res, error.message, 409);
        }
        sendError(res, error);
    }
};
