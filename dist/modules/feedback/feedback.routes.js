import { Router } from 'express';
import * as feedbackController from './feedback.controller.js';
const router = Router();
router.post('/', feedbackController.submitFeedback);
export default router;
