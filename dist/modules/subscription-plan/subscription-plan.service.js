import { SubscriptionPlanRepository } from './subscription-plan.repository.js';
export class SubscriptionPlanService {
    repository;
    constructor() {
        this.repository = new SubscriptionPlanRepository();
    }
    async createPlan(data) {
        if (data.type === 'HOURLY' && (!data.durationHours || data.durationHours <= 0)) {
            throw new Error('Duration hours must be greater than 0 for HOURLY plans');
        }
        if (data.type === 'ONE_TIME') {
            data.durationHours = undefined; // One time plans have unlimited duration
        }
        return this.repository.create(data);
    }
    async getPlansByAgronomist(agronomistId) {
        return this.repository.findByAgronomistId(agronomistId);
    }
    async getPlanById(planId) {
        return this.repository.findById(planId);
    }
    async updatePlan(planId, agronomistId, data) {
        const plan = await this.repository.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }
        if (plan.agronomistId !== agronomistId) {
            throw new Error('Unauthorized to update this plan');
        }
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.price !== undefined)
            updateData.price = data.price;
        return this.repository.update(planId, updateData);
    }
    async deletePlan(planId, agronomistId) {
        const plan = await this.repository.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }
        if (plan.agronomistId !== agronomistId) {
            throw new Error('Unauthorized to delete this plan');
        }
        await this.repository.delete(planId);
    }
}
