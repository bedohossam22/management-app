import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
    size?: 'sm' | 'md';
    withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    size = 'md',
    withDot = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors';

    const variantStyles: Record<string, string> = {
        primary: 'bg-blue-50 text-blue-700 border-blue-200',
        secondary: 'bg-purple-50 text-purple-700 border-purple-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
        outline: 'bg-transparent text-gray-700 border-gray-300',
    };

    const dotColors: Record<string, string> = {
        primary: 'bg-blue-500',
        secondary: 'bg-purple-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-cyan-500',
        neutral: 'bg-gray-400',
        outline: 'bg-gray-400',
    };

    const sizeStyles: Record<string, string> = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-1 gap-1.5',
    };

    return (
        <span
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {withDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'}`} />
            )}
            {children}
        </span>
    );
};
