import { ProductRepository } from './product.repository.js';
import { Product, Prisma } from '@prisma/client';
import cloudinary from '../../config/cloudinary.js';

export class ProductService {
    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
        return this.productRepository.create(data);
    }

    async getAllProducts(filters: { search?: string; categoryId?: string; disease?: string }): Promise<Product[]> {
        return this.productRepository.findAll(filters);
    }

    async getProductById(id: string): Promise<Product> {
        const product = await this.productRepository.findById(id);
        if (!product) throw new Error('Product not found');
        return product;
    }

    async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        const product = await this.productRepository.findById(id);
        if (!product) throw new Error('Product not found');

        // Note: Client-side URL extraction should handle old image cleanup locally if needed
        return this.productRepository.update(id, data);
    }

    async deleteProduct(id: string): Promise<boolean> {
        const product = await this.productRepository.findById(id);
        if (!product) throw new Error('Product not found');

        if (product.imageUrl) {
            const publicId = this.extractPublicIdFromUrl(product.imageUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('Failed to delete image from Cloudinary:', error);
                }
            }
        }

        await this.productRepository.delete(id);
        return true;
    }

    private extractPublicIdFromUrl(url: string): string | null {
        try {
            const segments = url.split('/');
            const uploadIndex = segments.findIndex(seg => seg === 'upload');
            if (uploadIndex === -1) return null;

            const pathParts = segments.slice(uploadIndex + 2);
            const fullPath = pathParts.join('/');

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
