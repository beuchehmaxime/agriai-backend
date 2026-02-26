"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = void 0;
const feedback_service_1 = require("./feedback.service");
const feedbackService = new feedback_service_1.FeedbackService();
const submitFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { diagnosisId, userId, outcome, comment } = req.body;
        if (!diagnosisId || !userId || !outcome) {
            return res.status(400).json({ message: 'Diagnosis ID, User ID, and Outcome are required' });
        }
        const feedback = yield feedbackService.submitFeedback(diagnosisId, userId, outcome, comment);
        res.json({ message: 'Feedback submitted successfully', feedback });
    }
    catch (error) {
        res.status(500).json({ message: 'Feedback submission failed', error: error.message });
    }
});
exports.submitFeedback = submitFeedback;
