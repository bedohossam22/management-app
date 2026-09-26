import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportTasksToCSV, exportTasksToJSON } from '../../utils/exportTasks';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import type { Task } from '../../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTaskForm?: () => void;
    onOpenShortcuts?: () => void;
}

interface PaletteItem {
    id: string;
    category: 'Actions' | 'Navigation' | 'Tasks';
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    badge?: string;
    badgeClass?: string;
    action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onOpenTaskForm,
    onOpenShortcuts,
}) => {
    const [query, setQuery] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Fetch tasks when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setLoadingTasks(true);

            api.get('/tasks')
                .then((res) => {
                    const data = res.data.data || res.data;
                    setTasks(Array.isArray(data) ? data : []);
                })
                .catch(() => {
                    // Fail silently or toast
                })
                .finally(() => {
                    setLoadingTasks(false);
                });

            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Handle Quick Actions
    const handleCreateTask = () => {
        onClose();
        if (onOpenTaskForm) {
            onOpenTaskForm();
        } else {
            navigate('/');
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-task-form'));
            }, 100);
        }
    };

    const handleOpenShortcutsGuide = () => {
        onClose();
        if (onOpenShortcuts) {
            onOpenShortcuts();
        } else {
            window.dispatchEvent(new CustomEvent('open-shortcuts-modal'));
        }
    };

    const handleExportCSV = () => {
        onClose();
        if (tasks.length === 0) {
            toast.warn('No tasks available to export');
            return;
        }
        const success = exportTasksToCSV(tasks);
        if (success) toast.success(`Exported ${tasks.length} tasks to CSV!`);
    };

    const handleExportJSON = () => {
        onClose();
        if (tasks.length === 0) {
            toast.warn('No tasks available to export');
            return;
        }
        const success = exportTasksToJSON(tasks);
        if (success) toast.success(`Exported ${tasks.length} tasks to JSON!`);
    };

    const handleLogout = () => {
        onClose();
        logout();
        navigate('/login');
    };

    // Build List of Items
    const items = useMemo<PaletteItem[]>(() => {
        const q = query.trim().toLowerCase();

        // 1. Navigation items
        const navItems: PaletteItem[] = [
            {
                id: 'nav-dashboard',
                category: 'Navigation',
                title: 'Go to Tasks Dashboard',
                subtitle: 'View and manage all task boards & lists',
                icon: (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                ),
                action: () => {
                    navigate('/');
                    onClose();
                },
            },
            {
                id: 'nav-calendar',
                category: 'Navigation',
                title: 'Go to Calendar',
                subtitle: 'View task deadlines and interactive calendar schedule',
                icon: (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                ),
                action: () => {
                    navigate('/calendar');
                    onClose();
                },
            },
            {
                id: 'nav-analytics',
                category: 'Navigation',
                title: 'Go to Analytics',
                subtitle: 'Productivity metrics, charts, and velocity breakdowns',
                icon: (
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                ),
                action: () => {
                    navigate('/analytics');
                    onClose();
                },
            },
        ];

        // 2. Action items
        const actionItems: PaletteItem[] = [
            {
                id: 'act-new-task',
                category: 'Actions',
                title: 'Create New Task',
                subtitle: 'Add a new task with priority, status, and deadline',
                icon: (
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                ),
                badge: 'Hot key: N',
                badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                action: handleCreateTask,
            },
            {
                id: 'act-export-csv',
                category: 'Actions',
                title: 'Export Tasks to CSV',
                subtitle: 'Download complete dataset in spreadsheet format',
                icon: (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                action: handleExportCSV,
            },
            {
                id: 'act-export-json',
                category: 'Actions',
                title: 'Export Tasks to JSON',
                subtitle: 'Export backup data in JSON structure',
                icon: (
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                ),
                action: handleExportJSON,
            },
            {
                id: 'act-shortcuts',
                category: 'Actions',
                title: 'Keyboard Shortcuts Guide',
                subtitle: 'View list of all hotkeys and quick controls',
                icon: (
                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                ),
                badge: 'Hot key: ?',
                badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
                action: handleOpenShortcutsGuide,
            },
            {
                id: 'act-logout',
                category: 'Actions',
                title: 'Log Out',
                subtitle: 'Sign out of your current account session',
                icon: (
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                ),
                action: handleLogout,
            },
        ];

        // 3. Matched Tasks
        const taskItems: PaletteItem[] = tasks.map((task) => ({
            id: `task-${task._id}`,
            category: 'Tasks',
            title: task.title,
            subtitle: task.description || (task.dueDate ? `Due: ${formatDate(task.dueDate)}` : 'No description'),
            icon: (
                <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-purple-500'}`} />
            ),
            badge: `${task.status} • ${task.priority}`,
            badgeClass: `${getStatusBadgeClass(task.status)} border`,
            action: () => {
                navigate('/');
                onClose();
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('select-task', { detail: task }));
                }, 100);
            },
        }));

        if (!q) {
            // Default view when query is empty: Actions, Nav, and top 5 recent tasks
            return [...actionItems, ...navItems, ...taskItems.slice(0, 5)];
        }

        const filteredNav = navItems.filter(
            (i) => i.title.toLowerCase().includes(q) || (i.subtitle && i.subtitle.toLowerCase().includes(q))
        );
        const filteredActions = actionItems.filter(
            (i) => i.title.toLowerCase().includes(q) || (i.subtitle && i.subtitle.toLowerCase().includes(q))
        );
        const filteredTasks = taskItems.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                (i.subtitle && i.subtitle.toLowerCase().includes(q)) ||
                (i.badge && i.badge.toLowerCase().includes(q))
        );

        return [...filteredTasks, ...filteredActions, ...filteredNav];
    }, [query, tasks, navigate, onClose, logout, handleCreateTask, handleExportCSV, handleExportJSON, handleOpenShortcutsGuide]);

    // Keyboard navigation within list
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items[selectedIndex]) {
                    items[selectedIndex].action();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, items, selectedIndex, onClose]);

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    // Group items for rendering
    const categories = Array.from(new Set(items.map((i) => i.category)));

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar Header */}
                <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
                    <div className="text-gray-400 mr-3 flex items-center">
                        {loadingTasks ? (
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tasks, navigate, or run commands..."
                        className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-hidden"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-md text-xs font-semibold hover:bg-gray-200/50 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-mono text-gray-400 bg-white border border-gray-200 rounded-md shadow-2xs">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-gray-50 flex-1">
                    {items.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">No results found for "{query}"</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching for a task name, page name, or action</p>
                        </div>
                    ) : (
                        categories.map((cat) => {
                            const catItems = items.filter((i) => i.category === cat);
                            return (
                                <div key={cat} className="py-2">
                                    <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        {cat}
                                    </div>
                                    <div className="space-y-1 mt-1">
                                        {catItems.map((item) => {
                                            const itemIndex = items.indexOf(item);
                                            const isSelected = itemIndex === selectedIndex;
                                            return (
                                                <button
                                                    key={item.id}
                                                    data-index={itemIndex}
                                                    onClick={() => item.action()}
                                                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-blue-50/80 text-blue-900 shadow-xs border-l-4 border-blue-600 pl-2.5'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100/80">
                                                            {item.icon}
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="text-sm font-semibold truncate flex items-center gap-2">
                                                                <span>{item.title}</span>
                                                            </div>
                                                            {item.subtitle && (
                                                                <div className="text-xs text-gray-500 truncate max-w-md">
                                                                    {item.subtitle}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                                        {item.badge && (
                                                            <span
                                                                className={`px-2 py-0.5 text-[11px] font-medium rounded-md ${
                                                                    item.badgeClass || 'bg-gray-100 text-gray-600'
                                                                }`}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-blue-600 bg-white border border-blue-200 rounded shadow-2xs">
                                                                ↵ Select
                                                            </kbd>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Hotkey Helpers */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 font-mono bg-white rounded border border-gray-200 text-gray-700 shadow-2xs">↑</kbd>
                            <kbd className="px-1.5 py-0.5 font-mono bg-white rounded border border-gray-200 text-gray-700 shadow-2xs">↓</kbd>
                            <span>to navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 font-mono bg-white rounded border border-gray-200 text-gray-700 shadow-2xs">↵</kbd>
                            <span>to select</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 font-mono bg-white rounded border border-gray-200 text-gray-700 shadow-2xs">esc</kbd>
                            <span>to close</span>
                        </span>
                    </div>
                    <div className="font-medium text-gray-400">
                        {items.length} {items.length === 1 ? 'result' : 'results'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
