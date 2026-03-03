import { MessageService } from './message.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const messageService = new MessageService();
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const consultationId = req.params.consultationId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const messages = await messageService.getMessages(consultationId, userId, page, limit);
        sendSuccess(res, 'Messages fetched successfully', messages);
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const consultationId = req.params.consultationId;
        const { text, imageUrl } = req.body;
        // if using multer, imageUrl might come from req.file.path (Cloudinary)
        // Check image logic later if required, but the schema allows just passing text or imageUrl string
        if (!text && !imageUrl && !req.file) {
            return sendError(res, new Error('Message must contain text or an image'), 400);
        }
        const finalImageUrl = req.file ? req.file.path : imageUrl;
        const message = await messageService.sendMessage(senderId, consultationId, text, finalImageUrl);
        sendSuccess(res, 'Message sent successfully', message, 201);
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const consultationId = req.params.consultationId;
        const count = await messageService.markMessagesAsRead(consultationId, userId);
        sendSuccess(res, 'Messages marked as read', { updatedCount: count });
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
