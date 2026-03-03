export const sendSuccess = (res, message, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
export const sendError = (res, error, statusCode = 500) => {
    res.status(statusCode).json({
        success: false,
        error: error.message || error || 'Internal Server Error',
    });
};
