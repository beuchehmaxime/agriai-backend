import { ExpertApplicationService } from './expert-application.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { ApplicationStatus } from '@prisma/client';
const expertApplicationService = new ExpertApplicationService();
export const submitApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { experience, qualifications, certificateType, obtainedYear, institution } = req.body;
        if (!experience)
            return sendError(res, new Error('Experience detail must be stated.'), 400);
        if (!qualifications || qualifications.length < 10)
            return sendError(res, new Error('Qualifications detail must be at least 10 characters long'), 400);
        if (!certificateType || certificateType.length < 2)
            return sendError(res, new Error('Certificate type must be specified'), 400);
        if (!obtainedYear || !/^\d{4}$/.test(obtainedYear))
            return sendError(res, new Error('Obtained year must be a 4-digit number'), 400);
        if (!institution || institution.length < 2)
            return sendError(res, new Error('Institution name must be specified'), 400);
        const certificateUrl = req.file?.path;
        if (!certificateUrl) {
            return sendError(res, new Error('Certificate PDF file is required'), 400);
        }
        const application = await expertApplicationService.submitApplication(userId, experience, qualifications, certificateType, obtainedYear, institution, certificateUrl);
        sendSuccess(res, 'Application submitted successfully', application, 201);
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
export const getApplications = async (req, res) => {
    try {
        const applications = await expertApplicationService.getApplications();
        sendSuccess(res, 'Applications fetched successfully', applications, 200);
    }
    catch (err) {
        sendError(res, err, 500);
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!Object.values(ApplicationStatus).includes(status)) {
            return sendError(res, new Error('Invalid status'), 400);
        }
        const application = await expertApplicationService.updateApplicationStatus(id, status);
        sendSuccess(res, 'Application status updated successfully', application, 200);
    }
    catch (err) {
        sendError(res, err, 400);
    }
};
