import { Router } from 'express';
import * as diagnosisController from './diagnosis.controller.js';
import { authenticate, verifyRole } from '../../shared/utils/middleware.utils.js';
import upload from '../../shared/utils/multer.config.js';

const router = Router();

router.post('/predict', authenticate, verifyRole('FARMER'), upload.single('image'), diagnosisController.predictDisease);
router.get('/history', authenticate, diagnosisController.getHistory);
router.delete('/:id', authenticate, diagnosisController.deleteDiagnosis);

export default router;
