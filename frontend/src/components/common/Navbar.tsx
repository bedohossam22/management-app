import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from './CommandPalette';
import ThemeToggle from './ThemeToggle';
import CoffeeTriggerButton from '../coffee/CoffeeTriggerButton';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    // Global Cmd+K / Ctrl+K hotkey listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsPaletteOpen((prev) => !prev);
            }
        };

        const handleOpenEvent = () => setIsPaletteOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleOpenEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleOpenEvent);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="bg-white dark:bg-stone-900 shadow-sm border-b border-gray-200 dark:border-stone-800 sticky top-0 z-30 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Brand & Nav items */}
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <NavLink to="/" className="flex items-center space-x-2.5 flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-stone-100 tracking-tight">Task Manager</span>
                            </NavLink>

                            <div className="flex items-center space-x-1">
                                <NavLink
                                    to="/"
                                    end
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                                                : 'text-gray-600 dark:text-stone-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-stone-800'
                                        }`
                                    }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    <span className="hidden sm:inline">Tasks</span>
                                </NavLink>

                                <NavLink
                                    to="/calendar"
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                                                : 'text-gray-600 dark:text-stone-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-stone-800'
                                        }`
                                    }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Calendar</span>
                                </NavLink>

                                <NavLink
                                    to="/analytics"
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                                                : 'text-gray-600 dark:text-stone-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-stone-800'
                                        }`
                                    }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Analytics</span>
                                </NavLink>
                            </div>
                        </div>

                        {/* Search / Command Palette Quick Trigger */}
                        <div className="flex-1 max-w-xs mx-4 hidden md:block">
                            <button
                                type="button"
                                onClick={() => setIsPaletteOpen(true)}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-500 dark:text-stone-400 bg-gray-50 dark:bg-stone-800 hover:bg-gray-100 dark:hover:bg-stone-750 hover:text-gray-700 dark:hover:text-stone-200 border border-gray-200 dark:border-stone-700 rounded-lg shadow-2xs transition-all cursor-pointer group"
                            >
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Quick Search & Commands...</span>
                                </div>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-stone-400 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded shadow-2xs">
                                    Ctrl K
                                </kbd>
                            </button>
                        </div>

                        {/* User profile & actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Coffee Bar trigger */}
                            <CoffeeTriggerButton />

                            <button
                                type="button"
                                onClick={() => setIsPaletteOpen(true)}
                                className="md:hidden p-2 text-gray-500 dark:text-stone-400 hover:text-gray-700 dark:hover:text-stone-200 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                                title="Search (Ctrl+K)"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            <ThemeToggle />

                            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-stone-300 bg-gray-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-stone-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <span className="font-medium text-gray-800 dark:text-stone-200">{user?.name}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
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

            <CommandPalette
                isOpen={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
            />
        </>
    );
};

export default Navbar;