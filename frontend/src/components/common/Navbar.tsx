import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand & Nav items */}
                    <div className="flex items-center space-x-8">
                        <NavLink to="/" className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-gray-900 tracking-tight">Task Manager</span>
                        </NavLink>

                        <div className="flex items-center space-x-1">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                <span>Tasks</span>
                            </NavLink>

                            <NavLink
                                to="/calendar"
                                className={({ isActive }) =>
                                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Calendar</span>
                            </NavLink>

                            <NavLink
                                to="/analytics"
                                className={({ isActive }) =>
                                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Analytics</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* User profile & actions */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span className="font-medium text-gray-800">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;