import { Router } from 'express';
import * as categoryController from './category.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
const router = Router();
// Publicly readable endpoints (for authenticated users like Farmers)
router.get('/', authenticate, categoryController.getAllCategories);
router.get('/:id', authenticate, categoryController.getCategoryById);
// Admin-only endpoints
router.post('/', authenticate, verifyRole('ADMIN'), categoryController.createCategory);
router.put('/:id', authenticate, verifyRole('ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, verifyRole('ADMIN'), categoryController.deleteCategory);
export default router;
