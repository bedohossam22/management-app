import type { FC } from 'react';

const LoadingSpinner: FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
};

export default LoadingSpinner;