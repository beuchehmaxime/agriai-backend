import { SubscriptionPlanRepository } from './subscription-plan.repository.js';
import { Prisma, PlanType, SubscriptionPlan } from '@prisma/client';

export class SubscriptionPlanService {
    private repository: SubscriptionPlanRepository;

    constructor() {
        this.repository = new SubscriptionPlanRepository();
    }

    async createPlan(data: {
        agronomistId: string;
        type: PlanType;
        price: number;
        title: string;
        description?: string;
        durationHours?: number;
    }): Promise<SubscriptionPlan> {
        if (data.type === 'HOURLY' && (!data.durationHours || data.durationHours <= 0)) {
            throw new Error('Duration hours must be greater than 0 for HOURLY plans');
        }
        if (data.type === 'ONE_TIME') {
            data.durationHours = undefined; // One time plans have unlimited duration
        }

        return this.repository.create(data as Prisma.SubscriptionPlanUncheckedCreateInput);
    }

    async getPlansByAgronomist(agronomistId: string): Promise<SubscriptionPlan[]> {
        return this.repository.findByAgronomistId(agronomistId);
    }

    async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
        return this.repository.findById(planId);
    }

    async updatePlan(planId: string, agronomistId: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
        const plan = await this.repository.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }
        if (plan.agronomistId !== agronomistId) {
            throw new Error('Unauthorized to update this plan');
        }
        
        const updateData: Partial<SubscriptionPlan> = {};
        if (data.title) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.price = data.price;

        return this.repository.update(planId, updateData);
    }

    async deletePlan(planId: string, agronomistId: string): Promise<void> {
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
