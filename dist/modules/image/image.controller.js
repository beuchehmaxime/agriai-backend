import { ImageService } from './image.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const imageService = new ImageService();
// Extended Request interface to include user from Auth middleware (if we had one)
// For MVP Guest login returns token, we need a middleware to extract userId.
// For now, let's assume userId is passed in body for simplicity or extracted.
// But wait, user must be authenticated.
// Let's assume we implement a basic auth middleware later or finding user by phone.
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, 'No image file provided', 400);
        }
        const userId = req.user?.id; // Extract userId from authenticated user
        if (!userId) {
            return sendError(res, 'User ID is required', 400);
        }
        const image = await imageService.uploadImage(userId, req.file);
        sendSuccess(res, 'Image uploaded successfully', { image });
    }
    catch (error) {
        sendError(res, error);
    }
};
