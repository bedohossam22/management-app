import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
            <div className="mb-6">
                <span className="text-8xl font-extrabold text-blue-600 tracking-tight">404</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
                ← Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
