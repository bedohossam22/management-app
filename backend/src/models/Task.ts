import mongoose, { Schema, Document } from 'mongoose';

// Define interface 
export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: Date;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Task Schema 

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Done'],
            default: 'To Do',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


taskSchema.index({ title: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);
