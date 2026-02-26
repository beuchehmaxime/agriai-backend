import { Request, Response } from 'express';
import { DiagnosisService } from './diagnosis.service.js';
import { ImageService } from '../image/image.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../shared/utils/middleware.utils.js';
import { SelectedCropsData } from '../../shared/utils/data.js';

const diagnosisService = new DiagnosisService();
const imageService = new ImageService();

export const predictDisease = async (req: AuthRequest, res: Response) => {
    try {
        const { location, cropType, symptoms } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, 'User ID is required', 401);
        }

        if (!req.file) {
            return sendError(res, 'No image file provided', 400);
        }
        if (!cropType) {
            return sendError(res, 'cropType is required for ML prediction', 400);
        }
        
        if (!SelectedCropsData.includes(cropType.toLowerCase())) {
            return sendError(res, 'Your selected crop is not supported yet. Please select a different crop.', 400);
        }

        // 1. Upload/Save Image first
        const image = await imageService.uploadImage(userId, req.file);

        // 2. Perform Diagnosis
        const diagnosis = await diagnosisService.diagnoseImage(
            userId,
            image.id,
            cropType.toLowerCase(),
            location || '',
            symptoms
        );

        sendSuccess(res, 'Diagnosis successful', { diagnosis });
    } catch (error: any) {
        sendError(res, error);
    }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id; // Or from auth middleware

        if (!userId || typeof userId !== 'string') {
            return sendError(res, 'User ID is required and must be a string', 400);
        }

        const history = await diagnosisService.getHistory(userId);
        sendSuccess(res, 'History fetched successfully', history);
    } catch (error: any) {
        sendError(res, error);
    }
}
