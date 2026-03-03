import { Router } from 'express';
import * as tipController from './tip.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
import upload from '../../shared/utils/multer.config.js';

const router = Router();

// Publicly readable endpoints (for authenticated users)
router.get('/', authenticate, tipController.getAllTips);
router.get('/:id', authenticate, tipController.getTipById);

// Create tip (Admin and Agronomist)
router.post('/', authenticate, verifyRole('ADMIN', 'AGRONOMIST'), upload.single('image'), tipController.createTip);

// Vote on tip (All authenticated users can vote)
router.post('/:id/vote', authenticate, tipController.voteTip);

// Update tip (Admin or Tip Author)
router.put('/:id', authenticate, verifyRole('ADMIN', 'AGRONOMIST'), upload.single('image'), tipController.updateTip);

// Approve/Reject tip (Admin only)
router.put('/:id/status', authenticate, verifyRole('ADMIN'), tipController.updateTipStatus);

// Delete tip (Admin or Tip Author)
router.delete('/:id', authenticate, verifyRole('ADMIN', 'AGRONOMIST'), tipController.deleteTip);

export default router;
