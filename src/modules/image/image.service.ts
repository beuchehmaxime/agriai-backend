import { ImageRepository } from './image.repository.js';
import { Image } from '@prisma/client';
import cloudinary from '../../config/cloudinary.js';

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

    async deleteImage(imageId: string): Promise<boolean> {
        const image = await this.imageRepository.findById(imageId);
        if (!image) {
            return false;
        }

        // Check if any other diagnoses still reference this image
        const count = await this.imageRepository.countDiagnoses(imageId);
        if (count > 0) {
            // Cannot delete image, it's used elsewhere
            return false;
        }

        // Delete from Cloudinary
        const publicId = this.extractPublicIdFromUrl(image.url);
        if (publicId) {
            try {
                // Determine resource_type if necessary, but default 'image' works for regular images
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Failed to delete image from Cloudinary:', error);
                // Optionally throw error, or continue deleting from DB. Let's continue.
            }
        }

        // Delete from DB
        await this.imageRepository.deleteById(imageId);
        return true;
    }

    private extractPublicIdFromUrl(url: string): string | null {
        try {
            // Example URL: https://res.cloudinary.com/dxyz/image/upload/v1234567890/folder/image_name.jpg
            const segments = url.split('/');
            const uploadIndex = segments.findIndex(seg => seg === 'upload');
            if (uploadIndex === -1) return null;

            // the public ID includes everything after 'upload/v.../' but before the file extension
            // e.g. segments = [..., 'upload', 'v123456', 'folder', 'image_name.jpg']
            const pathParts = segments.slice(uploadIndex + 2); // skips 'upload' and 'v...'
            const fullPath = pathParts.join('/');

            // Remove extension
            const lastDotIndex = fullPath.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                return fullPath.substring(0, lastDotIndex);
            }
            return fullPath;
        } catch (error) {
            return null;
        }
    }
}
