import { Router } from 'express';
import * as subscriptionController from './subscription.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';

const router = Router();

// Farmer routes
router.post('/', authenticate, verifyRole('FARMER'), subscriptionController.purchaseSubscription);
router.get('/my-subscriptions', authenticate, verifyRole('FARMER'), subscriptionController.getMySubscriptions);

// Agronomist routes
router.get('/subscribers', authenticate, verifyRole('AGRONOMIST'), subscriptionController.getSubscribersList);
router.post('/:id/deduct-hours', authenticate, verifyRole('AGRONOMIST'), subscriptionController.deductHours);

export default router;
