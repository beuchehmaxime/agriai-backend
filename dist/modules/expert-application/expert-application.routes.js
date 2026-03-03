import { Router } from 'express';
import * as controller from './expert-application.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
const router = Router();
// Only farmers can submit an application (agronomists and admins don't need to)
import { uploadPdf } from '../../shared/utils/multer.config.js';
router.post('/', authenticate, verifyRole('FARMER'), uploadPdf.single('certificate'), controller.submitApplication);
// Only admins can view and update applications
router.get('/', authenticate, verifyRole('ADMIN'), controller.getApplications);
router.patch('/:id/status', authenticate, verifyRole('ADMIN'), controller.updateApplicationStatus);
export default router;
