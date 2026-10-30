import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';

const QUICK_ICONS = ['🧑‍💻', '🚀', '🦊', '🐱', '🐼', '🦁', '🤖', '⚡', '☕', '🎨'];

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('🧑‍💻');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please choose a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const rawDataUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 350;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    setAvatar(canvas.toDataURL('image/jpeg', 0.88));
                } else {
                    setAvatar(rawDataUrl);
                }
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
    };

    const validate = (): boolean => {
        if (!name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (name.trim().length < 2 || name.trim().length > 50) {
            toast.error('Name must be between 2 and 50 characters');
            return false;
        }
        if (!email.trim()) {
            toast.error('Email is required');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!password) {
            toast.error('Password is required');
            return false;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
            toast.error('Password must contain at least one letter and one number');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await register({ name, email, password, avatar });
        setLoading(false);
        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div>
                            <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900">
                                Create your account
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in
                                </Link>
                            </p>
                    </div>

                            {/* Avatar Selection Preview */}
                            <div className="flex flex-col items-center p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                                <div className="relative mb-2">
                                    <UserAvatar avatar={avatar} name={name || 'You'} size="xl" className="shadow-sm ring-2 ring-blue-500" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Upload photo"
                                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                                    >
                                        📷
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <span className="text-xs font-semibold text-gray-700 mb-1.5">Pick an avatar or upload photo</span>

                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {QUICK_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setAvatar(icon)}
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform cursor-pointer border ${avatar === icon
                                                    ? 'bg-blue-100 border-blue-400 scale-110 shadow-xs'
                                                    : 'bg-white hover:bg-gray-100 border-gray-200'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="••••••••"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        At least 6 characters with 1 letter &amp; 1 number.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                                    >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                </div>
                );
};

                export default Register;
