import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <div className="relative rounded-lg shadow-sm">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
                            leftIcon ? 'pl-10' : ''
                        } ${rightIcon ? 'pr-10' : ''} ${
                            error
                                ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-100'
                        } ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
