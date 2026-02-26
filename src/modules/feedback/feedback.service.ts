import { FeedbackRepository } from './feedback.repository.js';
import { Feedback } from '@prisma/client';

export class FeedbackService {
    private feedbackRepository: FeedbackRepository;

    constructor() {
        this.feedbackRepository = new FeedbackRepository();
    }

    async submitFeedback(diagnosisId: string, userId: string, outcome: string, comment?: string): Promise<Feedback> {
        return this.feedbackRepository.create({
            outcome,
            comment,
            diagnosis: { connect: { id: diagnosisId } },
            user: { connect: { id: userId } },
        });
    }
}
