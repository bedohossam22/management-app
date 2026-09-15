import React from 'react';

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            id,
            className = '',
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    disabled={disabled}
                    className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white ${
                        error
                            ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-100'
                    } ${className}`}
                    {...props}
                >
                    {options
                        ? options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                  {opt.label}
                              </option>
                          ))
                        : children}
                </select>
                {error ? (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Select.displayName = 'Select';
