import { FeedbackRepository } from './feedback.repository.js';
export class FeedbackService {
    feedbackRepository;
    constructor() {
        this.feedbackRepository = new FeedbackRepository();
    }
    async submitFeedback(diagnosisId, userId, outcome, comment) {
        return this.feedbackRepository.create({
            outcome,
            comment,
            diagnosis: { connect: { id: diagnosisId } },
            user: { connect: { id: userId } },
        });
    }
}
