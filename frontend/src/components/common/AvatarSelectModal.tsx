import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from './UserAvatar';

interface AvatarSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PRESET_AVATAR_ICONS = [
    // Tech & Modern
    '🧑‍💻', '👩‍💻', '🚀', '🤖', '⚡', '🎯', '☕', '🎨',
    '💡', '👑', '🎮', '🔥', '⭐', '💎', '🛡️', '💼',
    // Animals & Fun
    '🦊', '🐱', '🦁', '🐼', '🐶', '🦉', '🐻', '🐰',
    '🐯', '🐵', '🐺', '🦄', '🦅', '🐧', '🐢', '🐬',
];

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUserAvatar } = useAuth();
    const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || '👤');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'icons' | 'upload'>('icons');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Sync when modal opens or user changes
    React.useEffect(() => {
        if (isOpen && user?.avatar) {
            setSelectedAvatar(user.avatar);
            if (user.avatar.startsWith('data:image') || user.avatar.startsWith('http')) {
                setActiveTab('upload');
            } else {
                setActiveTab('icons');
            }
        }
    }, [isOpen, user?.avatar]);

    if (!isOpen) return null;

    // Compress & convert file to light Base64 data URL
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please choose a valid image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image is too large. Please select an image under 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const rawDataUrl = event.target?.result as string;
            // Compress using canvas to max 400x400
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 380;
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
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
                    setSelectedAvatar(compressedDataUrl);
                    toast.success('Image loaded and ready!');
                } else {
                    setSelectedAvatar(rawDataUrl);
                }
            };
            img.onerror = () => {
                setSelectedAvatar(rawDataUrl);
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!selectedAvatar) return;
        setIsSaving(true);
        const res = await updateUserAvatar(selectedAvatar);
        setIsSaving(false);
        if (res.success) {
            onClose();
        }
    };

    const isCustomImage =
        selectedAvatar &&
        (selectedAvatar.startsWith('data:image') ||
            selectedAvatar.startsWith('http://') ||
            selectedAvatar.startsWith('https://'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-stone-800 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-stone-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100">
                            Choose Your Avatar
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-stone-400">
                            Pick an avatar icon or upload your custom profile photo
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Live Preview */}
                <div className="p-6 bg-gradient-to-b from-blue-50/50 via-gray-50/30 to-white dark:from-stone-850 dark:via-stone-900 dark:to-stone-900 flex flex-col items-center border-b border-gray-100 dark:border-stone-800">
                    <div className="relative group">
                        <UserAvatar
                            avatar={selectedAvatar}
                            name={user?.name}
                            size="2xl"
                            className="shadow-md ring-4 ring-white dark:ring-stone-800"
                        />
                        {isCustomImage && (
                            <button
                                type="button"
                                onClick={() => setSelectedAvatar('👤')}
                                title="Remove photo"
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <div className="font-bold text-gray-900 dark:text-stone-100 text-sm">
                            {user?.name || 'Your Profile'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-stone-400">{user?.email}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-stone-800 bg-gray-50 dark:bg-stone-850 p-1 m-4 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('icons')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'icons'
                                ? 'bg-white dark:bg-stone-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-200'
                            }`}
                    >
                        <span>😀</span>
                        <span>Avatar Icons</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'upload'
                                ? 'bg-white dark:bg-stone-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-200'
                            }`}
                    >
                        <span>📷</span>
                        <span>Upload Photo</span>
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="px-5 pb-5 overflow-y-auto flex-1">
                    {activeTab === 'icons' && (
                        <div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-1">
                                {PRESET_AVATAR_ICONS.map((icon) => {
                                    const isSelected = selectedAvatar === icon;
                                    return (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setSelectedAvatar(icon)}
                                            className={`h-11 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer border ${isSelected
                                                    ? 'bg-blue-100 dark:bg-blue-950/70 border-blue-500 ring-2 ring-blue-400 scale-110 shadow-sm'
                                                    : 'bg-gray-50 dark:bg-stone-800 hover:bg-gray-100 dark:hover:bg-stone-750 border-gray-200 dark:border-stone-700 hover:scale-105'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-stone-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/60 dark:bg-stone-850 hover:bg-blue-50/30"
                            >
                                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mb-2">
                                    📁
                                </div>
                                <p className="text-xs font-bold text-gray-800 dark:text-stone-200">
                                    Click or Drag photo here to upload
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-stone-500 mt-1">
                                    Supports PNG, JPG, GIF, WebP (up to 10MB)
                                </p>
                            </div>

                            {isCustomImage && (
                                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                                    <div className="flex items-center gap-2">
                                        <span>✅</span>
                                        <span className="font-semibold">Custom photo selected</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="font-bold underline hover:text-emerald-900 cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-stone-800 bg-gray-50/70 dark:bg-stone-850 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-stone-400 hover:bg-gray-200/80 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin text-sm">⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>Save Avatar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelectModal;
