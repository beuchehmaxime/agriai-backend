import { Router } from 'express';
import * as transactionController from './transaction.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';

const router = Router();

router.get('/wallet', authenticate, verifyRole('AGRONOMIST'), transactionController.getWallet);
router.post('/withdraw', authenticate, verifyRole('AGRONOMIST'), transactionController.withdraw);

export default router;
