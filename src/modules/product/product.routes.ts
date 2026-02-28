import { Router } from 'express';
import * as productController from './product.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
import upload from '../../shared/utils/multer.config.js';

const router = Router();

// Publicly readable endpoints (for authenticated users like Farmers)
router.get('/', authenticate, productController.getAllProducts);
router.get('/:id', authenticate, productController.getProductById);

// Admin-only endpoints
router.post('/', authenticate, verifyRole('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/:id', authenticate, verifyRole('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticate, verifyRole('ADMIN'), productController.deleteProduct);

export default router;
