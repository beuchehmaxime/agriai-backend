import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../user/user.repository.js';
export class AuthService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async register(data) {
        const { name, email, phoneNumber, password } = data;
        const existingUserByPhone = await this.userRepository.findByPhoneNumber(phoneNumber);
        if (existingUserByPhone) {
            throw new Error('User with this phone number already exists');
        }
        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new Error('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.userRepository.create({
            name,
            email,
            phoneNumber,
            passwordHash,
            userType: 'FARMER',
        });
        if (!user)
            throw new Error('An error occurred while creating the user.');
        const token = this.generateToken(user.id);
        return { user, token };
    }
    async login(data) {
        const { phoneNumber, password } = data;
        const user = await this.userRepository.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new Error('Invalid phone number or password');
        }
        if (!user.passwordHash) {
            throw new Error('Invalid phone number or password'); // For old guest users who don't have password
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid phone number or password');
        }
        const token = this.generateToken(user.id);
        return { user, token };
    }
    generateToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d',
        });
    }
}
