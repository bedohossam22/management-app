import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';

// Dfine interface

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}


//User Schema
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Hash password with bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model<IUser>('User', userSchema);
