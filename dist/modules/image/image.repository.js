import prisma from '../../shared/prisma/prisma.service.js';
export class ImageRepository {
    async create(data) {
        return prisma.image.create({ data });
    }
    async findById(id) {
        return prisma.image.findUnique({ where: { id } });
    }
    async deleteById(id) {
        return prisma.image.delete({ where: { id } });
    }
    async countDiagnoses(imageId) {
        return prisma.diagnosis.count({ where: { imageId } });
    }
}
