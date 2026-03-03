import { ConsultationService } from './consultation.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const consultationService = new ConsultationService();
export const getAgronomists = async (req, res) => {
    try {
        const userId = req.user.id;
        const agronomists = await consultationService.getAgronomists(userId);
        sendSuccess(res, 'Agronomists fetched successfully', agronomists);
    }
    catch (err) {
        sendError(res, err, 500);
    }
};
export const getMyConsultations = async (req, res) => {
    try {
        const userId = req.user.id;
        const consultations = await consultationService.getConsultations(userId);
        sendSuccess(res, 'Consultations fetched successfully', consultations);
    }
    catch (err) {
        sendError(res, err, 500);
    }
};
export const createConsultation = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { agronomistId } = req.body;
        if (!agronomistId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agronomistId)) {
            return sendError(res, new Error('Invalid agronomist ID format'), 400);
        }
        const consultation = await consultationService.createConsultation(farmerId, agronomistId);
        sendSuccess(res, 'Consultation created successfully', consultation, 201);
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
