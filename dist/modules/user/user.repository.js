import prisma from '../../shared/prisma/prisma.service.js';
export class UserRepository {
    async findByPhoneNumber(phoneNumber) {
        return prisma.user.findUnique({ where: { phoneNumber } });
    }
    async findAll() {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return users.map(user => {
            const { passwordHash, ...safeUser } = user;
            return { ...safeUser, passwordHash: null };
        });
    }
    async create(data) {
        return prisma.user.create({ data });
    }
    async findById(id) {
        return prisma.user.findUnique({ where: { id } });
    }
    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }
    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }
}
