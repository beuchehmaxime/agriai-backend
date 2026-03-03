import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';

const router = Router();

// Endpoint for admin dashboard stats
router.get('/stats', authenticate, verifyRole('ADMIN'), getDashboardStats);

export default router;
