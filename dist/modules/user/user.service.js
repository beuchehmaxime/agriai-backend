import { UserRepository } from './user.repository.js';
import bcrypt from 'bcrypt';
export class UserService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async updateProfile(userId, data) {
        if (data.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already in use by another account');
            }
        }
        const updatedUser = await this.userRepository.update(userId, data);
        return updatedUser;
    }
    async getAllUsers() {
        return this.userRepository.findAll();
    }
    async updateUserAdmin(userId, data) {
        if (data.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already in use by another account');
            }
        }
        if (data.phoneNumber) {
            const existingPhone = await this.userRepository.findByPhoneNumber(data.phoneNumber);
            if (existingPhone && existingPhone.id !== userId) {
                throw new Error('Phone number is already in use by another account');
            }
        }
        const updatedUser = await this.userRepository.update(userId, data);
        return updatedUser;
    }
    async updateUserPasswordAdmin(userId, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        return this.userRepository.update(userId, { passwordHash });
    }
}
