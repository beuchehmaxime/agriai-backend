import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data?: any, statusCode: number = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const sendError = (res: Response, error: any, statusCode: number = 500) => {
    const errorMsg = error.message || error || 'Internal Server Error';
    console.error(`[SEND_ERROR] ${statusCode}:`, errorMsg);
    res.status(statusCode).json({
        success: false,
        error: errorMsg,
    });
};
