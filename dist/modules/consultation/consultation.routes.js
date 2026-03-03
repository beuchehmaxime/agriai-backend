import { Router } from 'express';
import * as controller from './consultation.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
const router = Router();
router.get('/', authenticate, controller.getMyConsultations);
router.get('/agronomists', authenticate, controller.getAgronomists);
router.post('/', authenticate, verifyRole('FARMER'), controller.createConsultation);
export default router;
