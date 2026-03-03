import { ProductService } from './product.service.js';
import { sendSuccess, sendError } from '../../shared/utils/response.utils.js';
const productService = new ProductService();
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stockQuantity, categoryId, diseaseTags } = req.body;
        const adminId = req.user?.id;
        if (!adminId)
            return sendError(res, 'Unauthorized', 401);
        if (!name || !description || !price || !stockQuantity || !categoryId) {
            return sendError(res, 'All required fields must be provided', 400);
        }
        let tagArray = [];
        if (diseaseTags) {
            if (Array.isArray(diseaseTags)) {
                tagArray = diseaseTags;
            }
            else if (typeof diseaseTags === 'string') {
                try {
                    tagArray = JSON.parse(diseaseTags);
                }
                catch (e) {
                    // Fallback to comma-separated string if it's not valid JSON
                    tagArray = diseaseTags.split(',').map(t => t.trim()).filter(t => t);
                }
            }
        }
        // image path is populated by our multer Cloudinary config
        const imageUrl = req.file ? req.file.path : null;
        const product = await productService.createProduct({
            name,
            description,
            price: parseFloat(price),
            stockQuantity: parseInt(stockQuantity, 10),
            category: { connect: { id: categoryId } },
            imageUrl,
            diseaseTags: tagArray,
            admin: { connect: { id: adminId } }
        });
        sendSuccess(res, 'Product created successfully', product, 201);
    }
    catch (error) {
        sendError(res, error);
    }
};
export const getAllProducts = async (req, res) => {
    try {
        const { search, categoryId, disease } = req.query;
        const products = await productService.getAllProducts({
            search: search,
            categoryId: categoryId,
            disease: disease
        });
        sendSuccess(res, 'Products fetched successfully', products);
    }
    catch (error) {
        sendError(res, error);
    }
};
export const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productService.getProductById(id);
        sendSuccess(res, 'Product fetched successfully', product);
    }
    catch (error) {
        if (error.message === 'Product not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
export const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, stockQuantity, categoryId, diseaseTags } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (price)
            updateData.price = parseFloat(price);
        if (stockQuantity)
            updateData.stockQuantity = parseInt(stockQuantity, 10);
        if (categoryId)
            updateData.category = { connect: { id: categoryId } };
        if (diseaseTags) {
            if (Array.isArray(diseaseTags)) {
                updateData.diseaseTags = diseaseTags;
            }
            else if (typeof diseaseTags === 'string') {
                try {
                    updateData.diseaseTags = JSON.parse(diseaseTags);
                }
                catch (e) {
                    // Fallback to comma-separated string if it's not valid JSON
                    updateData.diseaseTags = diseaseTags.split(',').map(t => t.trim()).filter(t => t);
                }
            }
        }
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }
        const updatedProduct = await productService.updateProduct(id, updateData);
        sendSuccess(res, 'Product updated successfully', updatedProduct);
    }
    catch (error) {
        if (error.message === 'Product not found') {
            return sendError(res, error.message, 404);
        }
        sendError(res, error);
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        await productService.deleteProduct(id);
        sendSuccess(res, 'Product deleted successfully');
    }
    catch (error) {
        if (error.message === 'Product not found') {
            return sendError(res, error.message, 404);
        }
        if (error.code === 'P2003') {
            return sendError(res, 'Cannot delete product because it is tied to orders', 400);
        }
        sendError(res, error);
    }
};
