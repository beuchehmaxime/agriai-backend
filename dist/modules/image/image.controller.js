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
exports.uploadImage = void 0;
const image_service_1 = require("./image.service");
const imageService = new image_service_1.ImageService();
// Extended Request interface to include user from Auth middleware (if we had one)
// For MVP Guest login returns token, we need a middleware to extract userId.
// For now, let's assume userId is passed in body for simplicity or extracted.
// But wait, user must be authenticated.
// Let's assume we implement a basic auth middleware later or finding user by phone.
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const { userId } = req.body; // In real app, from req.user
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const image = yield imageService.uploadImage(userId, req.file);
        res.json({ message: 'Image uploaded successfully', image });
    }
    catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});
exports.uploadImage = uploadImage;
