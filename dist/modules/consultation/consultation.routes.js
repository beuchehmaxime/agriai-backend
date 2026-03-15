import { Router } from 'express';
import * as controller from './consultation.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
import { requireActiveSubscriptionForConsultation } from '../subscription/subscription.middleware.js';
const router = Router();
router.get('/', authenticate, controller.getMyConsultations);
router.get('/agronomists', authenticate, controller.getAgronomists);
router.post('/', authenticate, verifyRole('FARMER'), requireActiveSubscriptionForConsultation, controller.createConsultation);
export default router;
