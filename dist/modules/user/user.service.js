import { UserRepository } from './user.repository.js';
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
}
