import { TipRepository } from './tip.repository.js';
import cloudinary from '../../config/cloudinary.js';
export class TipService {
    tipRepository;
    constructor() {
        this.tipRepository = new TipRepository();
    }
    async createTip(data) {
        return this.tipRepository.create(data);
    }
    async getAllTips(filters) {
        return this.tipRepository.findAll(filters);
    }
    async getTipById(id) {
        const tip = await this.tipRepository.findById(id);
        if (!tip)
            throw new Error('Tip not found');
        return tip;
    }
    async updateTip(id, data) {
        const tip = await this.tipRepository.findById(id);
        if (!tip)
            throw new Error('Tip not found');
        return this.tipRepository.update(id, data);
    }
    async deleteTip(id) {
        const tip = await this.tipRepository.findById(id);
        if (!tip)
            throw new Error('Tip not found');
        if (tip.imageUrl) {
            const publicId = this.extractPublicIdFromUrl(tip.imageUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                }
                catch (error) {
                    console.error('Failed to delete image from Cloudinary:', error);
                }
            }
        }
        await this.tipRepository.delete(id);
        return true;
    }
    async voteTip(tipId, userId, isHelpful) {
        const tip = await this.tipRepository.findById(tipId);
        if (!tip)
            throw new Error('Tip not found');
        const existingVote = await this.tipRepository.findVote(tipId, userId);
        if (existingVote) {
            return this.tipRepository.updateVote(tipId, userId, isHelpful);
        }
        else {
            return this.tipRepository.createVote({
                tipId,
                userId,
                isHelpful
            });
        }
    }
    extractPublicIdFromUrl(url) {
        try {
            const segments = url.split('/');
            const uploadIndex = segments.findIndex(seg => seg === 'upload');
            if (uploadIndex === -1)
                return null;
            const pathParts = segments.slice(uploadIndex + 2);
            const fullPath = pathParts.join('/');
            const lastDotIndex = fullPath.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                return fullPath.substring(0, lastDotIndex);
            }
            return fullPath;
        }
        catch (error) {
            return null;
        }
    }
}
