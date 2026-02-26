import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agriai_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req: any, file: any) => `${Date.now()}-${file.originalname.split('.')[0]}`
    } as any
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
