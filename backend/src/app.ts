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

// Middleware
app.use(cors());
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