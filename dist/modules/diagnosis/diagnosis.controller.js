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
exports.getHistory = exports.predictDisease = void 0;
const diagnosis_service_1 = require("./diagnosis.service");
const diagnosisService = new diagnosis_service_1.DiagnosisService();
const predictDisease = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, imageId, location } = req.body;
        if (!userId || !imageId) {
            return res.status(400).json({ message: 'User ID and Image ID are required' });
        }
        // In a real app, verify user ownership of image or if image is public.
        const diagnosis = yield diagnosisService.diagnoseImage(userId, imageId, location || '');
        res.json({ message: 'Diagnosis successful', diagnosis });
    }
    catch (error) {
        res.status(500).json({ message: 'Diagnosis failed', error: error.message });
    }
});
exports.predictDisease = predictDisease;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params; // Or from auth middleware
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'User ID is required and must be a string' });
        }
        const history = yield diagnosisService.getHistory(userId);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
});
exports.getHistory = getHistory;
