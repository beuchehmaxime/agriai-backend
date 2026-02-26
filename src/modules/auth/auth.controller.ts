import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!phoneNumber || !password) {
            return sendError(res, 'Phone number and password are required', 400);
        }

        const { user, token } = await authService.login({ phoneNumber, password });

        // Return only necessary user info
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userType: user.userType
        };

        sendSuccess(res, 'Login successful', { user: safeUser, token });
    } catch (error: any) {
        console.log(error.message)
        sendError(res, error, error.message === 'Invalid phone number or password' ? 401 : 500);
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        if (!name || !email || !phoneNumber || !password) {
            return sendError(res, 'Name, email, phone number, and password are required', 400);
        }

        // Basic validation
        if (phoneNumber.length !== 9) {
            return sendError(res, 'Phone number must be exactly 9 digits', 400);
        }

        // Email regex validation could be added here, but let's stick to basic presence for now or simple check
        if (!email.includes('@')) {
            return sendError(res, 'Invalid email address', 400);
        }

        const { user, token } = await authService.register({ name, email, phoneNumber, password });

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userType: user.userType
        };

        sendSuccess(res, 'Registration successful', { user: safeUser, token }, 201);
    } catch (error: any) {
        // Handle unique constraint violations or other logic errors
        const status = (error.message.includes('already exists')) ? 409 : 500;
        sendError(res, error, status);
    }
};

