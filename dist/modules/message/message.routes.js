import { Router } from 'express';
import * as controller from './message.controller.js';
import { authenticate } from '../../shared/utils/middleware.utils.js';
import upload from '../../shared/utils/multer.config.js';
const router = Router();
// Uses upload.single('image') to support image uploads
router.get('/:consultationId', authenticate, controller.getMessages);
router.post('/:consultationId', authenticate, upload.single('image'), controller.sendMessage);
router.put('/:consultationId/read', authenticate, controller.markAsRead);
export default router;
