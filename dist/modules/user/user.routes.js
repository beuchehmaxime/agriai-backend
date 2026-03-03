import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate } from '../../shared/utils/middleware.utils.js';
const router = Router();
router.put('/profile', authenticate, userController.updateProfile);
export default router;
