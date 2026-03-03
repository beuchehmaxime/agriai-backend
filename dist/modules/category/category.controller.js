import { CategoryService } from './category.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const categoryService = new CategoryService();
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return sendError(res, 'Category name is required', 400);
        }
        const category = await categoryService.createCategory({ name, description });
        sendSuccess(res, 'Category created successfully', category, 201);
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            return sendError(res, error.message, 409);
        }
        sendError(res, error);
    }
};
export const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        sendSuccess(res, 'Categories fetched successfully', categories);
    }
    catch (error) {
        sendError(res, error);
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await categoryService.getCategoryById(id);
        sendSuccess(res, 'Category fetched successfully', category);
    }
    catch (error) {
        if (error.message === 'Category not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
export const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        const updated = await categoryService.updateCategory(id, { name, description });
        sendSuccess(res, 'Category updated successfully', updated);
    }
    catch (error) {
        if (error.message === 'Category not found') {
            return sendError(res, error.message, 404);
        }
        if (error.message.includes('already exists')) {
            return sendError(res, error.message, 409);
        }
        sendError(res, error);
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await categoryService.deleteCategory(id);
        sendSuccess(res, 'Category deleted successfully');
    }
    catch (error) {
        if (error.message === 'Category not found') {
            return sendError(res, error.message, 404);
        }
        // Prisma foreign key constraint failure
        if (error.code === 'P2003') {
            return sendError(res, 'Cannot delete category because it has associated products', 400);
        }
        sendError(res, error);
    }
};
