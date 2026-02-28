import { DiagnosisRepository } from './diagnosis.repository.js';
import { ImageRepository } from '../image/image.repository.js';
import { ImageService } from '../image/image.service.js';
import { Diagnosis } from '@prisma/client';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8007';

// Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class DiagnosisService {
    private diagnosisRepository: DiagnosisRepository;
    private imageRepository: ImageRepository;
    private imageService: ImageService;
    private ai: GoogleGenAI | null = null;

    constructor() {
        this.diagnosisRepository = new DiagnosisRepository();
        this.imageRepository = new ImageRepository();
        this.imageService = new ImageService();

        if (GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        } else {
            console.warn('GEMINI_API_KEY is not set. Gemini integration will not work.');
        }
    }

    async diagnoseImage(userId: string, imageId: string, cropType: string, location?: string, symptoms?: string): Promise<Diagnosis> {

        const image = await this.imageRepository.findById(imageId);
        if (!image) throw new Error('Image not found');

        // ===============================
        // 1. CALL ML SERVICE
        // ===============================
        let disease = 'Unknown';
        let confidence = 0;

        try {


            console.log(`Sending image to ML Service: ${ML_SERVICE_URL}/${cropType}/predict`);

            const mlResponse = await axios.post(`${ML_SERVICE_URL}/${cropType}/predict`, {
                imageUrl: image.url,
                cropType,
                symptoms,
                location
            });

            if (mlResponse.data) {
                const rawDisease = mlResponse.data.disease || 'Unknown';
                disease = this.formatDiseaseName(rawDisease);
                confidence = mlResponse.data.confidence || 0;
            }
        } catch (error) {
            console.error('Error calling ML Service:', error instanceof Error ? error.message : error);
        }

        // ===============================
        // 2. CALL GEMINI (NEW SDK STYLE)
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
                        The user uploaded a crop image for diagnosis.

                        ${contextInfo}

                        The automated ML system could not identify the disease.

                        Provide:
                        1. Possible diseases based on crop and symptoms
                        2. General crop health advice
                        3. Signs to inspect on leaves/stems
                        4. Preventive maintenance tips

                        Keep it concise and farmer-friendly.
                        `;
                } else {
                    prompt = `
                        The ML system diagnosed **${disease}** with confidence ${confidence}.

                        ${contextInfo}

                        Provide:
                        1. Short explanation of the disease
                        2. Treatment steps (chemical + organic)
                        3. Prevention tips for future seasons

                        Keep it concise and farmer-friendly.
                        `;
                }

                const response = await this.ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: prompt,
                });

                advice = response.text ?? 'No advice generated.';
            } catch (error) {
                console.error('Error calling Gemini API:', error);
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

    async getHistory(userId: string) {
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

    async deleteDiagnosis(diagnosisId: string, userId: string): Promise<boolean> {
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

    private formatDiseaseName(disease: string): string {
        return disease
            .replace(/_/g, ' ')                // Replace underscores with spaces
            .toLowerCase()                     // Normalize casing
            .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
    }
}
