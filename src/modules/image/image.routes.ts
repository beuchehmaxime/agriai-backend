import { Router } from 'express';
import * as imageController from './image.controller.js';
import upload from '../../shared/utils/multer.config.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';

const router = Router();

router.post('/upload', authenticate, verifyRole('FARMER'), upload.single('image'), imageController.uploadImage);

export default router;
