import { DiagnosisRepository } from './diagnosis.repository.js';
import { ImageRepository } from '../image/image.repository.js';
import { ImageService } from '../image/image.service.js';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { SelectedCropsData } from '../../shared/utils/data.js';
// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8007';
// Shared secret so the ML service rate-limits per user instead of per backend IP
const ML_SERVICE_API_KEY = process.env.ML_SERVICE_API_KEY;
// Claude API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
export class DiagnosisService {
    diagnosisRepository;
    imageRepository;
    imageService;
    ai = null;
    constructor() {
        this.diagnosisRepository = new DiagnosisRepository();
        this.imageRepository = new ImageRepository();
        this.imageService = new ImageService();
        if (ANTHROPIC_API_KEY) {
            this.ai = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
        }
        else {
            console.warn('ANTHROPIC_API_KEY is not set. Claude integration will not work.');
        }
        if (!ML_SERVICE_API_KEY) {
            console.warn('ML_SERVICE_API_KEY is not set. All users will share the ML service per-IP rate limit.');
        }
    }
    async diagnoseImage(userId, imageId, cropType, location, symptoms) {
        const image = await this.imageRepository.findById(imageId);
        if (!image)
            throw new Error('Image not found');
        // ===============================
        // 1. CALL ML SERVICE
        // ===============================
        let disease = 'Unknown';
        let confidence = 0;
        // Only crops with a trained model go to the ML service; the rest are
        // diagnosed by Claude from the image alone.
        if (SelectedCropsData.includes(cropType)) {
            try {
                console.log(`Sending image to ML Service: ${ML_SERVICE_URL}/${cropType}/predict`);
                const mlResponse = await axios.post(`${ML_SERVICE_URL}/${cropType}/predict`, {
                    imageUrl: image.url,
                    cropType,
                    symptoms,
                    location
                }, {
                    headers: ML_SERVICE_API_KEY
                        ? { 'X-API-Key': ML_SERVICE_API_KEY, 'X-User-Id': userId }
                        : undefined,
                });
                if (mlResponse.data) {
                    const rawDisease = mlResponse.data.disease || 'Unknown';
                    disease = this.formatDiseaseName(rawDisease);
                    confidence = mlResponse.data.confidence || 0;
                }
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.error(`ML Service rate limit hit for user ${userId}`);
                }
                else {
                    console.error('Error calling ML Service:', error instanceof Error ? error.message : error);
                }
            }
        }
        // ===============================
        // 2. CALL CLAUDE
        // ===============================
        let advice = 'No advice available.';
        if (this.ai) {
            try {
                const contextInfo = `
                    Crop Type: ${cropType || 'Not specified'}
                    Symptoms: ${symptoms || 'Not specified'}
                    Location: ${location || 'Not specified'}
                    `;
                let prompt = "";
                if (disease === 'Unknown') {
                    prompt = `
                        The user uploaded the attached crop image for diagnosis.

                        ${contextInfo}

                        The automated ML system could not identify the disease.

                        Provide:
                        1. Possible diseases based on the image, crop and symptoms
                        2. General crop health advice
                        3. Signs to inspect on leaves/stems
                        4. Preventive maintenance tips

                        Keep it concise and farmer-friendly.
                        `;
                }
                else {
                    const isLowConfidence = confidence < 0.9;
                    prompt = `
                        The ML system diagnosed **${disease}** with confidence ${confidence}.

                        ${contextInfo}

                        ${isLowConfidence
                        ? 'Since the confidence is below 90%, the VERY FIRST text in your response MUST be a warning telling the user to be careful with the medication and consult an expert.\\n\\n                        Below that warning text, provide:'
                        : 'Provide:'}
                        1. Short explanation of the disease
                        2. Treatment steps (chemical + organic)
                        3. Prevention tips for future seasons

                        Keep it concise and farmer-friendly.
                        `;
                }
                // Without an ML result, let Claude look at the photo itself
                const content = disease === 'Unknown'
                    ? [
                        { type: 'image', source: { type: 'url', url: image.url } },
                        { type: 'text', text: prompt },
                    ]
                    : [{ type: 'text', text: prompt }];
                const response = await this.ai.messages.create({
                    model: ANTHROPIC_MODEL,
                    max_tokens: 16000,
                    messages: [{ role: 'user', content }],
                });
                if (response.stop_reason === 'refusal') {
                    console.warn('Claude declined the diagnosis request:', response.stop_details?.category);
                    advice = 'Could not retrieve advice at this time.';
                }
                else {
                    const text = response.content
                        .filter((block) => block.type === 'text')
                        .map(block => block.text)
                        .join('\n')
                        .trim();
                    advice = text || 'No advice generated.';
                }
            }
            catch (error) {
                if (error instanceof Anthropic.APIError) {
                    console.error(`Claude API error ${error.status}:`, error.message);
                }
                else {
                    console.error('Error calling Claude API:', error);
                }
                advice = 'Could not retrieve advice at this time.';
            }
        }
        // ===============================
        // 3. SAVE DIAGNOSIS
        // ===============================
        return this.diagnosisRepository.create({
            disease,
            confidence,
            advice,
            cropType,
            symptoms,
            image: { connect: { id: imageId } },
            user: { connect: { id: userId } },
        });
    }
    async getHistory(userId) {
        const diagnoses = await this.diagnosisRepository.findByUserId(userId);
        return diagnoses.map(d => ({
            id: d.id,
            disease: d.disease,
            confidence: d.confidence,
            advice: d.advice,
            cropType: d.cropType || '',
            crop: d.cropType || undefined,
            symptoms: d.symptoms || undefined,
            imageUrl: d.image?.url || undefined,
            imageUri: d.image?.url || undefined,
            createdAt: d.createdAt.toISOString(),
            image: d.image ? {
                id: d.image.id,
                url: d.image.url
            } : undefined
        }));
    }
    async deleteDiagnosis(diagnosisId, userId) {
        const diagnosis = await this.diagnosisRepository.findById(diagnosisId);
        if (!diagnosis) {
            throw new Error('Diagnosis not found');
        }
        if (diagnosis.userId !== userId) {
            throw new Error('Unauthorized to delete this diagnosis');
        }
        const imageId = diagnosis.imageId;
        // 1. Delete associated feedbacks
        await this.diagnosisRepository.deleteFeedbacksByDiagnosisId(diagnosisId);
        // 2. Delete diagnosis
        await this.diagnosisRepository.deleteById(diagnosisId);
        // 3. Attempt to delete image (service will check if it's safe to delete)
        await this.imageService.deleteImage(imageId);
        return true;
    }
    formatDiseaseName(disease) {
        return disease
            .replace(/_/g, ' ') // Replace underscores with spaces
            .toLowerCase() // Normalize casing
            .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
    }
}
