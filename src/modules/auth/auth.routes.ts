import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import { authenticate } from '../../shared/utils/middleware.utils.js';

const router = Router();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/logout', authenticate, authController.logout);

export default router;
