import { Link } from 'react-router-dom';

const NotAuthorizedPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
            <div className="mb-6">
                <span className="text-8xl font-extrabold text-red-500 tracking-tight">403</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authorized</h1>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">
                You don't have permission to access this page. Please log in with the correct account.
            </p>
            <div className="flex items-center gap-3">
                <Link
                    to="/login"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    Go to Login
                </Link>
                <Link
                    to="/"
                    className="inline-flex items-center px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotAuthorizedPage;
