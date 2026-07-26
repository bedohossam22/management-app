import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/Mongodb';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();
connectDB();

const app = express();

// CORS — explicitly allow the deployed frontend + local dev
const allowedOrigins = [
    'https://management-app-frontend-five.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Thunder Client, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// Handle preflight OPTIONS requests explicitly (required for Vercel serverless)
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get(['/', '/api'], (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API is running',
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Global error handler
app.use(errorHandler);

export default app;