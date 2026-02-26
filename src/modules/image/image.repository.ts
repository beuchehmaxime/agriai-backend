import prisma from '../../shared/prisma/prisma.service.js';
import { Image, Prisma } from '@prisma/client';

export class ImageRepository {
    async create(data: Prisma.ImageCreateInput): Promise<Image> {
        return prisma.image.create({ data });
    }

    async findById(id: string): Promise<Image | null> {
        return prisma.image.findUnique({ where: { id } });
    }
}
