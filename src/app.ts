import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sendError } from './shared/utils/response.utils.js';
// Import routes here later

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/uploads', express.static('uploads'));


// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);
    sendError(res, err, 500);
});

export default app;
