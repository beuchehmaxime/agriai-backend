import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agriai_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req: any, file: any) => `${Date.now()}-${file.originalname.split('.')[0]}`,
        timeout: 120000 // 120 seconds timeout for slower uploads
    } as any
});

const pdfStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agriai_certificates',
        allowed_formats: ['pdf'],
        format: 'pdf',
        resource_type: 'raw',
        public_id: (req: any, file: any) => `cert-${Date.now()}-${Math.round(Math.random() * 1000)}.pdf`,
        timeout: 120000 // 120 seconds timeout
    } as any
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export const uploadPdf = multer({
    storage: pdfStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB specifically for PDFs
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

export default upload;
