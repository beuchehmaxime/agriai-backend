import { FeedbackService } from './feedback.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const feedbackService = new FeedbackService();
export const submitFeedback = async (req, res) => {
    try {
        const { diagnosisId, userId, outcome, comment } = req.body;
        if (!diagnosisId || !userId || !outcome) {
            return sendError(res, 'Diagnosis ID, User ID, and Outcome are required', 400);
        }
        const feedback = await feedbackService.submitFeedback(diagnosisId, userId, outcome, comment);
        sendSuccess(res, 'Feedback submitted successfully', { feedback });
    }
    catch (error) {
        sendError(res, error);
    }
};
