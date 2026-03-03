import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { sendError } from './shared/utils/response.utils.js';
// Import routes here later

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Agri AI API is running' });
});

// API Routes
import authRoutes from './modules/auth/auth.routes.js';
import imageRoutes from './modules/image/image.routes.js';
import diagnosisRoutes from './modules/diagnosis/diagnosis.routes.js';
import feedbackRoutes from './modules/feedback/feedback.routes.js';
import userRoutes from './modules/user/user.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import productRoutes from './modules/product/product.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import expertApplicationRoutes from './modules/expert-application/expert-application.routes.js';
import consultationRoutes from './modules/consultation/consultation.routes.js';
import messageRoutes from './modules/message/message.routes.js';
import tipRoutes from './modules/tip/tip.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expert-application', expertApplicationRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/uploads', express.static('uploads'));


// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);
    if (err.name === 'MulterError' || err.message === 'Only PDF files are allowed!') {
        return sendError(res, err.message, 400);
    }
    sendError(res, err, 500);
});

export default app;
