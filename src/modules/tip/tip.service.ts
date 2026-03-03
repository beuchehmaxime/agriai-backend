import { TipRepository } from './tip.repository.js';
import { Tip, Prisma, TipStatus, TipVote } from '@prisma/client';
import cloudinary from '../../config/cloudinary.js';

export class TipService {
    private tipRepository: TipRepository;

    constructor() {
        this.tipRepository = new TipRepository();
    }

    async createTip(data: Prisma.TipCreateInput): Promise<Tip> {
        return this.tipRepository.create(data);
    }

    async getAllTips(filters: { status?: TipStatus, authorId?: string }): Promise<any[]> {
        return this.tipRepository.findAll(filters);
    }

    async getTipById(id: string): Promise<any> {
        const tip = await this.tipRepository.findById(id);
        if (!tip) throw new Error('Tip not found');
        return tip;
    }

    async updateTip(id: string, data: Prisma.TipUpdateInput): Promise<Tip> {
        const tip = await this.tipRepository.findById(id);
        if (!tip) throw new Error('Tip not found');
        return this.tipRepository.update(id, data);
    }

    async deleteTip(id: string): Promise<boolean> {
        const tip = await this.tipRepository.findById(id);
        if (!tip) throw new Error('Tip not found');

        if (tip.imageUrl) {
            const publicId = this.extractPublicIdFromUrl(tip.imageUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('Failed to delete image from Cloudinary:', error);
                }
            }
        }

        await this.tipRepository.delete(id);
        return true;
    }

    async voteTip(tipId: string, userId: string, isHelpful: boolean): Promise<TipVote> {
        const tip = await this.tipRepository.findById(tipId);
        if (!tip) throw new Error('Tip not found');

        const existingVote = await this.tipRepository.findVote(tipId, userId);
        if (existingVote) {
            return this.tipRepository.updateVote(tipId, userId, isHelpful);
        } else {
            return this.tipRepository.createVote({
                tipId,
                userId,
                isHelpful
            });
        }
    }

    private extractPublicIdFromUrl(url: string): string | null {
        try {
            const segments = url.split('/');
            const uploadIndex = segments.findIndex(seg => seg === 'upload');
            if (uploadIndex === -1) return null;

            const pathParts = segments.slice(uploadIndex + 2);
            const fullPath = pathParts.join('/');

            const lastDotIndex = fullPath.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                return fullPath.substring(0, lastDotIndex);
            }
            return fullPath;
        } catch (error) {
            return null;
        }
    }
}
