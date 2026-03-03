import { sendError } from '../../shared/utils/response.utils.js';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
export const validateRegister = (req, res, next) => {
    const { name, email, phoneNumber, password } = req.body;
    if (!name || name.trim().length < 2) {
        return sendError(res, 'Name must be at least 2 characters long.', 400);
    }
    if (!email || !EMAIL_REGEX.test(email)) {
        return sendError(res, 'Invalid email address.', 400);
    }
    if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
        return sendError(res, 'Phone number must be exactly 9 digits.', 400);
    }
    if (!password || !PASSWORD_REGEX.test(password)) {
        return sendError(res, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.', 400);
    }
    // if(confirmpassword !== password){
    //     return sendError(res, "Password and confirm password must be equal.", 400)
    // }
    next();
};
export const validateLogin = (req, res, next) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
        return sendError(res, 'Phone number must be exactly 9 digits.', 400);
    }
    if (!password || password.trim().length === 0) {
        return sendError(res, 'Password is required.', 400);
    }
    next();
};
