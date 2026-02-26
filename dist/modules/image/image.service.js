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
exports.ImageService = void 0;
const image_repository_1 = require("./image.repository");
class ImageService {
    constructor() {
        this.imageRepository = new image_repository_1.ImageRepository();
    }
    uploadImage(userId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageUrl = `/uploads/${file.filename}`; // Local URL for MVP
            // Check if user exists? Prisma will throw error if foreign key fails.
            // We assume userId comes from auth middleware.
            return this.imageRepository.create({
                url: imageUrl,
                user: { connect: { id: userId } },
            });
        });
    }
}
exports.ImageService = ImageService;
