import { ImageRepository } from './image.repository.js';
import { Image } from '@prisma/client';

export class ImageService {
    private imageRepository: ImageRepository;

    constructor() {
        this.imageRepository = new ImageRepository();
    }

    async uploadImage(userId: string, file: Express.Multer.File): Promise<Image> {
        // Cloudinary storage puts the URL in file.path
        const imageUrl = file.path;

        // Check if user exists? Prisma will throw error if foreign key fails.
        // We assume userId comes from auth middleware.

        return this.imageRepository.create({
            url: imageUrl,
            user: { connect: { id: userId } },
        });
    }
}
