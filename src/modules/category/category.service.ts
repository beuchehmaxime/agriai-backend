import { CategoryRepository } from './category.repository.js';
import { Category, Prisma } from '@prisma/client';

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
        const existing = await this.categoryRepository.findByName(data.name);
        if (existing) {
            throw new Error('Category with this name already exists');
        }
        return this.categoryRepository.create(data);
    }

    async getAllCategories(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }

    async getCategoryById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error('Category not found');
        return category;
    }

    async updateCategory(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error('Category not found');

        if (data.name && typeof data.name === 'string' && data.name !== category.name) {
            const existing = await this.categoryRepository.findByName(data.name);
            if (existing) throw new Error('Category with this name already exists');
        }

        return this.categoryRepository.update(id, data);
    }

    async deleteCategory(id: string): Promise<boolean> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new Error('Category not found');

        // Let prisma handle the constraint violation if there are connected products
        await this.categoryRepository.delete(id);
        return true;
    }
}
