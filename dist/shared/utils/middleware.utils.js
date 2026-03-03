import jwt from 'jsonwebtoken';
import { UserRepository } from '../../modules/user/user.repository.js';
const userRepository = new UserRepository();
export const authenticate = async (req, res, next) => {
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
        const decoded = jwt.verify(token, secret);
        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        const effectiveRoles = [...allowedRoles];
        if (effectiveRoles.includes('FARMER') && !effectiveRoles.includes('AGRONOMIST')) {
            effectiveRoles.push('AGRONOMIST');
        }
        if (!user || !effectiveRoles.includes(user.userType)) {
            return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource." });
        }
        next();
    };
};
