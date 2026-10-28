import mongoose, { Schema, Document } from 'mongoose';

// Define note interface
export interface INote {
    _id?: mongoose.Types.ObjectId;
    content: string;
    createdAt?: Date;
}

// Define reaction interface
export interface IReaction {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    userName?: string;
}

// Define comment interface
export interface IComment {
    _id?: mongoose.Types.ObjectId;
    text: string;
    user?: mongoose.Types.ObjectId;
    userName?: string;
    reactions?: IReaction[];
    createdAt?: Date;
}

// Define subtask interface
export interface ISubtask {
    _id?: mongoose.Types.ObjectId;
    title: string;
    isCompleted: boolean;
}

// Define interface 
export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: Date;
    subtasks: ISubtask[];
    notes: INote[];
    comments: IComment[];
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Subtask Schema
const subtaskSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Subtask title is required'],
            trim: true,
            maxlength: [200, 'Subtask title cannot exceed 200 characters'],
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

// Note Schema
const noteSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, 'Note content is required'],
            trim: true,
            maxlength: [1000, 'Note cannot exceed 1000 characters'],
        },
    },
    { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

// Reaction Schema
const reactionSchema = new Schema(
    {
        emoji: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            trim: true,
            default: 'User',
        },
    },
    { _id: false }
);

// Comment Schema
const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: [true, 'Comment text is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        userName: {
            type: String,
            trim: true,
            default: 'Anonymous',
        },
        reactions: {
            type: [reactionSchema],
            default: [],
        },
    },
    { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

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
        subtasks: {
            type: [subtaskSchema],
            default: [],
        },
        notes: {
            type: [noteSchema],
            default: [],
        },
        comments: {
            type: [commentSchema],
            default: [],
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
