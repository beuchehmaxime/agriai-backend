import { Router } from 'express';
import * as orderController from './order.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
const router = Router();
// Public endpoints (for authenticated users)
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
// Admin endpoints
router.patch('/:id/status', authenticate, verifyRole('ADMIN'), orderController.updateOrderStatus);
export default router;
