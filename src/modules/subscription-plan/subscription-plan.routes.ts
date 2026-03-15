import { Router } from 'express';
import * as subscriptionPlanController from './subscription-plan.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';

const router = Router();

// Agronomist routes
router.post('/', authenticate, verifyRole('AGRONOMIST'), subscriptionPlanController.createPlan);
router.get('/my-plans', authenticate, verifyRole('AGRONOMIST'), subscriptionPlanController.getMyPlans);
router.put('/:id', authenticate, verifyRole('AGRONOMIST'), subscriptionPlanController.updatePlan);
router.delete('/:id', authenticate, verifyRole('AGRONOMIST'), subscriptionPlanController.deletePlan);

// Public/Farmer routes
router.get('/agronomist/:agronomistId', authenticate, subscriptionPlanController.getAgronomistPlans);

export default router;
