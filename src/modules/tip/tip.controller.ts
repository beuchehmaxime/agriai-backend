import { Request, Response } from 'express';
import { TipService } from './tip.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
import { AuthRequest } from '../../types/auth-request.js';
import { TipStatus } from '@prisma/client';

const tipService = new TipService();

export const createTip = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content } = req.body;
        const authorId = req.user!.id;
        const userType = req.user!.userType;

        // Admins can create tips that are automatically approved
        const status: TipStatus = userType === 'ADMIN' ? 'APPROVED' : 'PENDING';

        let imageUrl: string | undefined = undefined;
        if (req.file) {
            imageUrl = req.file.path; // Set by Cloudinary storage
        }

        const newTip = await tipService.createTip({
            title,
            content,
            imageUrl,
            status,
            author: { connect: { id: authorId } }
        });

        sendSuccess(res, 'Tip created successfully', newTip, 201);
    } catch (error) {
        sendError(res, error);
    }
};

export const getAllTips = async (req: AuthRequest, res: Response) => {
    try {
        const userType = req.user!.userType;
        const userId = req.user!.id;
        const { status } = req.query;

        let filters: { status?: TipStatus, authorId?: string } = {};

        if (userType === 'FARMER') {
            filters.status = 'APPROVED';
        } else if (userType === 'AGRONOMIST') {
            if (status === 'mine') {
                filters.authorId = userId;
            } else {
                filters.status = status as TipStatus || 'APPROVED';
            }
        } else {
            // ADMIN
            if (status) {
                filters.status = status as TipStatus;
            }
        }

        const tips = await tipService.getAllTips(filters);
        sendSuccess(res, 'Tips fetched successfully', tips);
    } catch (error) {
        sendError(res, error);
    }
};

export const getTipById = async (req: Request, res: Response) => {
    try {
        const tip = await tipService.getTipById(req.params.id as string);
        sendSuccess(res, 'Tip fetched successfully', tip);
    } catch (error) {
        sendError(res, error, 404);
    }
};

export const updateTip = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content } = req.body;
        const tipId = req.params.id as string;
        const user = req.user!;

        const existingTip = await tipService.getTipById(tipId);

        // Allow only the author to edit unless admin
        if (user.userType !== 'ADMIN' && existingTip.author.id !== user.id) {
            return sendError(res, new Error("Forbidden: You can only edit your own tips"), 403);
        }

        let imageUrl = existingTip.imageUrl;
        if (req.file && req.file.path) {
            imageUrl = req.file.path;
        }

        const updatedTip = await tipService.updateTip(tipId, {
            title,
            content,
            imageUrl
        });

        sendSuccess(res, 'Tip updated successfully', updatedTip);
    } catch (error) {
        sendError(res, error);
    }
};

export const updateTipStatus = async (req: AuthRequest, res: Response) => {
    try {
        const tipId = req.params.id as string;
        const { status } = req.body; // PENDING, APPROVED, REJECTED

        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return sendError(res, new Error("Invalid status"), 400);
        }

        const updatedTip = await tipService.updateTip(tipId, { status });
        sendSuccess(res, 'Tip status updated successfully', updatedTip);
    } catch (error) {
        sendError(res, error);
    }
};

export const deleteTip = async (req: AuthRequest, res: Response) => {
    try {
        const tipId = req.params.id as string;
        const user = req.user!;

        const existingTip = await tipService.getTipById(tipId);

        if (user.userType !== 'ADMIN' && existingTip.author.id !== user.id) {
            return sendError(res, new Error("Forbidden: You can only delete your own tips"), 403);
        }

        await tipService.deleteTip(tipId);
        sendSuccess(res, 'Tip deleted successfully');
    } catch (error) {
        sendError(res, error);
    }
};

export const voteTip = async (req: AuthRequest, res: Response) => {
    try {
        const tipId = req.params.id as string;
        const userId = req.user!.id;
        let isHelpful = req.body.isHelpful;

        if (typeof isHelpful !== 'boolean') {
            // allow parsing string like "true", "false"
            if (isHelpful === 'true') isHelpful = true;
            else if (isHelpful === 'false') isHelpful = false;
            else return sendError(res, new Error("isHelpful must be a boolean"), 400);
        }

        const vote = await tipService.voteTip(tipId, userId, isHelpful);
        sendSuccess(res, 'Vote recorded successfully', vote);
    } catch (error) {
        sendError(res, error);
    }
};
