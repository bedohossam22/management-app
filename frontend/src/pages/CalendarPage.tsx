import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import api from '../services/api';
import type { Task, TaskFormData } from '../types';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../utils/helpers';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Current displayed Month & Year
    const [currentDate, setCurrentDate] = useState(() => new Date());

    // Selected Day for details panel
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [detailTask, setDetailTask] = useState<Task | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [defaultDueDate, setDefaultDueDate] = useState<string>('');

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            const data = response.data.data || response.data;
            setTasks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    // Task Actions
    const handleCreateTask = async (formData: TaskFormData) => {
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, formData);
                toast.success('Task updated successfully!');
            } else {
                await api.post('/tasks', formData);
                toast.success('Task created successfully!');
            }
            setIsFormOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save task');
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            toast.success('Task deleted.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleDuplicateTask = async (task: Task) => {
        try {
            let dueDate = '';
            if (task.dueDate) {
                const orig = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (!isNaN(orig.getTime()) && orig >= today) {
                    dueDate = orig.toISOString().split('T')[0];
                } else {
                    dueDate = today.toISOString().split('T')[0];
                }
            } else {
                dueDate = new Date().toISOString().split('T')[0];
            }

            const duplicatePayload: TaskFormData = {
                title: `${task.title} (Copy)`,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
                dueDate,
            };

            const response = await api.post('/tasks', duplicatePayload);
            const created = response.data.data || response.data;
            if (created && created._id) {
                setTasks((prev) => [created, ...prev]);
            } else {
                fetchTasks();
            }
            toast.success(`Task "${task.title}" duplicated!`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to duplicate task');
        }
    };

    const handleStatusChange = async (id: string, status: Task['status']) => {
        try {
            setTasks((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status } : t))
            );
            await api.put(`/tasks/${id}`, { status });
            toast.success(`Task marked as ${status}`);
        } catch (err: any) {
            fetchTasks();
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleOpenCreateForDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setDefaultDueDate(`${yyyy}-${mm}-${dd}`);
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleViewDetails = (task: Task) => {
        setDetailTask(task);
        setIsDetailsOpen(true);
    };

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchQuery, statusFilter, priorityFilter]);

    // Map tasks to dates (key: YYYY-MM-DD)
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        filteredTasks.forEach((task) => {
            if (!task.dueDate) return;
            const d = new Date(task.dueDate);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!map[key]) {
                map[key] = [];
            }
            map[key].push(task);
        });
        return map;
    }, [filteredTasks]);

    // Selected day tasks
    const selectedDateKey = useMemo(() => {
        if (!selectedDate) return '';
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, [selectedDate]);

    const selectedDayTasks = useMemo(() => {
        if (!selectedDateKey) return [];
        return tasksByDate[selectedDateKey] || [];
    }, [selectedDateKey, tasksByDate]);

    // Calendar Grid Days Calculation
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startingDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const days = [];

        // Previous month trailing days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const dateObj = new Date(year, month - 1, dayNum);
            const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            days.push({
                date: dateObj,
                dayNumber: dayNum,
                isCurrentMonth: false,
                dateKey,
            });
        }

        // Current month days
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date: dateObj,
                dayNumber: i,
                isCurrentMonth: true,
                dateKey,
            });
        }

        // Next month leading days to complete full weeks
        const remainingSlots = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingSlots && days.length < 42; i++) {
            const dateObj = new Date(year, month + 1, i);
            const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            days.push({
                date: dateObj,
                dayNumber: i,
                isCurrentMonth: false,
                dateKey,
            });
        }

        return days;
    }, [currentDate]);

    // Summary Statistics
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        let overdue = 0;
        let dueToday = 0;
        let completed = 0;

        tasks.forEach((t) => {
            if (t.status === 'Done') {
                completed++;
            } else if (t.dueDate) {
                const d = new Date(t.dueDate);
                if (d < todayStart) overdue++;
                else if (d >= todayStart && d <= todayEnd) dueToday++;
            }
        });

        return {
            total: tasks.length,
            overdue,
            dueToday,
            completed,
        };
    }, [tasks]);

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Title & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <span>Calendar & Schedule</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Visualize your deadlines and manage scheduled tasks effortlessly
                        </p>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
                            <div className="text-xs text-gray-500 font-medium">Due Today</div>
                            <div className="text-lg font-bold text-amber-600">{stats.dueToday}</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
                            <div className="text-xs text-gray-500 font-medium">Overdue</div>
                            <div className="text-lg font-bold text-rose-600">{stats.overdue}</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
                            <div className="text-xs text-gray-500 font-medium">Completed</div>
                            <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
                        </div>
                    </div>
                </div>

                {/* Controls & Filters Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-2xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Month Navigation */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                                    title="Previous Month"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleToday}
                                    className="px-3 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                                    title="Next Month"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 min-w-[170px]">
                                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                        </div>

                        {/* Search & Status/Priority Filters */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-48">
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg
                                    className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Statuses</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            {/* Add Task Button */}
                            <button
                                onClick={() => handleOpenCreateForDate(selectedDate || new Date())}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Task</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout: Calendar Grid + Selected Day Drawer */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Calendar Month Grid */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 text-center text-xs font-bold text-gray-600 py-3">
                            {DAYS_OF_WEEK.map((day, idx) => (
                                <div key={day} className={idx === 0 || idx === 6 ? 'text-gray-400' : ''}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Month Days Grid */}
                        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
                            {calendarDays.map((item, idx) => {
                                const dayTasks = tasksByDate[item.dateKey] || [];
                                const currentDay = isToday(item.date);
                                const selected = isSelected(item.date);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(item.date)}
                                        className={`min-h-[105px] p-2 flex flex-col justify-between transition-all cursor-pointer group ${
                                            !item.isCurrentMonth
                                                ? 'bg-gray-50/50 text-gray-400'
                                                : 'bg-white hover:bg-blue-50/30'
                                        } ${
                                            selected
                                                ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/40'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span
                                                className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                                                    currentDay
                                                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                        : selected
                                                        ? 'text-blue-700 font-bold bg-blue-100'
                                                        : item.isCurrentMonth
                                                        ? 'text-gray-800'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                {item.dayNumber}
                                            </span>

                                            {/* Hover Quick Add */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenCreateForDate(item.date);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-0.5 rounded hover:bg-gray-100 transition-opacity"
                                                title={`Add task for ${item.dateKey}`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Task Chips for this day */}
                                        <div className="space-y-1 overflow-hidden">
                                            {dayTasks.slice(0, 3).map((task) => (
                                                <div
                                                    key={task._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(task);
                                                    }}
                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-all ${
                                                        task.status === 'Done'
                                                            ? 'bg-emerald-100 text-emerald-800 line-through opacity-80'
                                                            : task.status === 'In Progress'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}
                                                    title={`${task.title} (${task.status})`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                            task.priority === 'High'
                                                                ? 'bg-red-500'
                                                                : task.priority === 'Medium'
                                                                ? 'bg-amber-500'
                                                                : 'bg-green-500'
                                                        }`}
                                                    />
                                                    <span className="truncate">{task.title}</span>
                                                </div>
                                            ))}

                                            {dayTasks.length > 3 && (
                                                <div className="text-[10px] text-gray-500 font-semibold pl-1">
                                                    +{dayTasks.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Agenda & Details Panel */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 flex flex-col min-h-[450px]">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                    {selectedDate ? formatDate(selectedDate.toISOString()) : 'Selected Day'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'} scheduled
                                </p>
                            </div>

                            <button
                                onClick={() => handleOpenCreateForDate(selectedDate || new Date())}
                                className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add</span>
                            </button>
                        </div>

                        {/* Tasks list for selected day */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                            {loading ? (
                                <div className="text-center py-12 text-sm text-gray-400">Loading schedule...</div>
                            ) : selectedDayTasks.length > 0 ? (
                                selectedDayTasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="bg-gray-50/90 rounded-xl p-3.5 border border-gray-200/80 hover:border-blue-300 transition-all shadow-2xs group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadgeClass(
                                                        task.status
                                                    )}`}
                                                >
                                                    {task.status}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleDuplicateTask(task)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Duplicate task"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(task)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit task"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    title="Delete task"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <h4
                                            onClick={() => handleViewDetails(task)}
                                            className="font-semibold text-gray-900 text-sm hover:text-blue-600 cursor-pointer leading-tight mb-1"
                                        >
                                            {task.title}
                                        </h4>

                                        {task.description && (
                                            <p className="text-gray-500 text-xs line-clamp-2 mb-2.5">
                                                {task.description}
                                            </p>
                                        )}

                                        {/* Status Switcher Footer */}
                                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-gray-400 font-medium">Status:</span>
                                            <div className="flex items-center gap-1">
                                                {task.status !== 'To Do' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task._id, 'To Do')}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                                                    >
                                                        To Do
                                                    </button>
                                                )}
                                                {task.status !== 'In Progress' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task._id, 'In Progress')}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                                                    >
                                                        In Progress
                                                    </button>
                                                )}
                                                {task.status !== 'Done' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task._id, 'Done')}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                                    >
                                                        ✓ Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-gray-400">
                                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs font-medium text-gray-500">No tasks on this date</p>
                                    <button
                                        onClick={() => handleOpenCreateForDate(selectedDate || new Date())}
                                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        + Schedule a task
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <TaskForm
                isOpen={isFormOpen}
                initialData={editingTask}
                defaultDueDate={defaultDueDate}
                onSubmit={handleCreateTask}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditingTask(null);
                }}
            />

            <TaskDetails
                isOpen={isDetailsOpen}
                task={detailTask}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setDetailTask(null);
                }}
            />
        </div>
    );
};

export default CalendarPage;
