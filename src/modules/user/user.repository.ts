import prisma from '../../shared/prisma/prisma.service.js';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { phoneNumber } });
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return users.map(user => {
            const { passwordHash, ...safeUser } = user;
            return { ...safeUser, passwordHash: null } as unknown as User;
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }
}
