import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
const router = Router();
router.put('/profile', authenticate, userController.updateProfile);
// Admin-only User Management Routes
router.get('/all', authenticate, verifyRole('ADMIN'), userController.getAllUsers);
router.put('/:id', authenticate, verifyRole('ADMIN'), userController.updateUserAdmin);
router.put('/:id/password', authenticate, verifyRole('ADMIN'), userController.updateUserPasswordAdmin);
export default router;
