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
exports.DiagnosisService = void 0;
const diagnosis_repository_1 = require("./diagnosis.repository");
const image_repository_1 = require("../image/image.repository");
// Mock ML Service URL - in real app, use env var
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
// Mock Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock-key';
class DiagnosisService {
    constructor() {
        this.diagnosisRepository = new diagnosis_repository_1.DiagnosisRepository();
        this.imageRepository = new image_repository_1.ImageRepository();
    }
    diagnoseImage(userId, imageId, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield this.imageRepository.findById(imageId);
            if (!image) {
                throw new Error('Image not found');
            }
            // 1. Call ML Service
            // In MVP, we might mock this if Python service isn't running yet.
            // const mlResponse = await axios.post(ML_SERVICE_URL, { imageUrl: image.url });
            // const { disease, confidence } = mlResponse.data;
            // MOCK RESPONSE
            const disease = "Mock Disease";
            const confidence = 0.95;
            // 2. Call Gemini API for advice
            // const adviceResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, { ... });
            // const advice = adviceResponse.data...
            // MOCK ADVICE
            const advice = "Mock advice for " + disease + ". Treat with care.";
            // 3. Save Diagnosis
            return this.diagnosisRepository.create({
                disease,
                confidence,
                advice,
                image: { connect: { id: imageId } },
                user: { connect: { id: userId } },
            });
        });
    }
    getHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.diagnosisRepository.findByUserId(userId);
        });
    }
}
exports.DiagnosisService = DiagnosisService;
