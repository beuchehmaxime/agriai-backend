import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserType } from '@prisma/client';
import { UserRepository } from '../../modules/user/user.repository.js';

// Extend Express Request interface to include user
export interface AuthRequest extends Request {
    user?: User;
}

const userRepository = new UserRepository();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Malformed token' });
        }

        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret) as { userId: string };

        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export const verifyRole = (...allowedRoles: UserType[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.userType)) {
            return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource." });
        }

        next();
    };
};

