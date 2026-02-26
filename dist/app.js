"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes here later
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Agri AI API is running' });
});
// API Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const image_routes_1 = __importDefault(require("./modules/image/image.routes"));
const diagnosis_routes_1 = __importDefault(require("./modules/diagnosis/diagnosis.routes"));
const feedback_routes_1 = __importDefault(require("./modules/feedback/feedback.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/images', image_routes_1.default);
app.use('/api/diagnosis', diagnosis_routes_1.default);
app.use('/api/feedback', feedback_routes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});
exports.default = app;
