import { UserRepository } from './user.repository.js';
import { User } from '@prisma/client';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<User> {
        if (data.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already in use by another account');
            }
        }

        const updatedUser = await this.userRepository.update(userId, data);
        return updatedUser;
    }
}
