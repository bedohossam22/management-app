import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    hoverable = false,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
                hoverable ? 'hover:shadow-md transition-shadow' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-5 pb-0 flex flex-col space-y-1.5 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 leading-none ${className}`} {...props}>
            {children}
        </h3>
    );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <p className={`text-sm text-gray-500 ${className}`} {...props}>
            {children}
        </p>
    );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-5 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-5 pt-0 flex items-center ${className}`} {...props}>
            {children}
        </div>
    );
};
