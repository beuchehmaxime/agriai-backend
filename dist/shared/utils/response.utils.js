export const sendSuccess = (res, message, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
export const sendError = (res, error, statusCode = 500) => {
    const errorMsg = error.message || error || 'Internal Server Error';
    console.error(`[SEND_ERROR] ${statusCode}:`, errorMsg);
    res.status(statusCode).json({
        success: false,
        error: errorMsg,
    });
};
