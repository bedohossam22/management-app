import React from 'react';

interface UserAvatarProps {
    avatar?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    showBorder?: boolean;
    title?: string;
}

const sizeClasses: Record<string, { container: string; text: string; icon: string }> = {
    xs: { container: 'w-5 h-5', text: 'text-[10px]', icon: 'text-xs' },
    sm: { container: 'w-7 h-7', text: 'text-xs', icon: 'text-sm' },
    md: { container: 'w-9 h-9', text: 'text-sm font-semibold', icon: 'text-lg' },
    lg: { container: 'w-11 h-11', text: 'text-base font-bold', icon: 'text-2xl' },
    xl: { container: 'w-16 h-16', text: 'text-xl font-bold', icon: 'text-3xl' },
    '2xl': { container: 'w-24 h-24', text: 'text-2xl font-bold', icon: 'text-5xl' },
};

const getAvatarColor = (name: string = 'User') => {
    const colors = [
        'bg-blue-600 text-white',
        'bg-indigo-600 text-white',
        'bg-emerald-600 text-white',
        'bg-amber-600 text-white',
        'bg-purple-600 text-white',
        'bg-rose-600 text-white',
        'bg-teal-600 text-white',
        'bg-cyan-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
    avatar,
    name = 'User',
    size = 'md',
    className = '',
    showBorder = true,
    title,
}) => {
    const config = sizeClasses[size] || sizeClasses.md;
    const isImage =
        avatar &&
        (avatar.startsWith('data:image') ||
            avatar.startsWith('http://') ||
            avatar.startsWith('https://') ||
            avatar.startsWith('blob:'));

    const [imgError, setImgError] = React.useState(false);

    // Reset error if avatar changes
    React.useEffect(() => {
        setImgError(false);
    }, [avatar]);

    const borderStyle = showBorder ? 'ring-1 ring-black/10 dark:ring-white/10' : '';

    if (isImage && !imgError) {
        return (
            <div
                title={title || name}
                className={`relative shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-stone-800 ${config.container} ${borderStyle} ${className}`}
            >
                <img
                    src={avatar}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
        );
    }

    if (avatar && !isImage) {
        return (
            <div
                title={title || name}
                className={`shrink-0 rounded-full flex items-center justify-center bg-gray-100 dark:bg-stone-800 shadow-2xs select-none ${config.container} ${borderStyle} ${className}`}
            >
                <span className={`${config.icon} leading-none`}>{avatar}</span>
            </div>
        );
    }

    return (
        <div
            title={title || name}
            className={`shrink-0 rounded-full flex items-center justify-center font-bold tracking-tight select-none ${
                config.container
            } ${getAvatarColor(name)} ${borderStyle} ${className}`}
        >
            <span className={`${config.text} leading-none`}>{getInitials(name)}</span>
        </div>
    );
};

export default UserAvatar;

