import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('MongoDB_URI is not defined in enviroment varaibles');
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('You are connected to MONGO_DB');
    } catch (error) {
        console.error('MONGO_DB connection error', error);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    console.log(' MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(' MongoDB connection error:', err);
});

export default connectDB;