import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import api from '../services/api';
import type { Task } from '../types';

const AnalyticsPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'all' | '30days' | '7days'>('all');

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            const data = response.data.data || response.data;
            setTasks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch tasks';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleStatusChange = async (id: string, status: Task['status']) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            setTasks((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status } : t))
            );
            toast.success('Task status updated!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    // Filter tasks by time range (based on createdAt or dueDate)
    const filteredTasks = useMemo(() => {
        if (timeRange === 'all') return tasks;

        const now = new Date();
        const days = timeRange === '7days' ? 7 : 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        return tasks.filter((t) => {
            const taskDate = t.createdAt ? new Date(t.createdAt) : new Date(t.dueDate);
            return taskDate >= cutoff;
        });
    }, [tasks, timeRange]);

    // Derived metrics
    const metrics = useMemo(() => {
        const total = filteredTasks.length;
        const completed = filteredTasks.filter((t) => t.status === 'Done').length;
        const inProgress = filteredTasks.filter((t) => t.status === 'In Progress').length;
        const todo = filteredTasks.filter((t) => t.status === 'To Do').length;

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
        const todoRate = total > 0 ? Math.round((todo / total) * 100) : 0;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // Due date categorizations
        const overdueTasks = filteredTasks.filter((t) => {
            if (!t.dueDate || t.status === 'Done') return false;
            return new Date(t.dueDate) < todayStart;
        });

        const dueTodayTasks = filteredTasks.filter((t) => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d >= todayStart && d <= todayEnd;
        });

        const upcomingTasks = filteredTasks.filter((t) => {
            if (!t.dueDate || t.status === 'Done') return false;
            return new Date(t.dueDate) > todayEnd;
        });

        // Priority breakdowns
        const highTasks = filteredTasks.filter((t) => t.priority === 'High');
        const highDone = highTasks.filter((t) => t.status === 'Done').length;
        const highRate = highTasks.length > 0 ? Math.round((highDone / highTasks.length) * 100) : 0;

        const mediumTasks = filteredTasks.filter((t) => t.priority === 'Medium');
        const mediumDone = mediumTasks.filter((t) => t.status === 'Done').length;
        const mediumRate = mediumTasks.length > 0 ? Math.round((mediumDone / mediumTasks.length) * 100) : 0;

        const lowTasks = filteredTasks.filter((t) => t.priority === 'Low');
        const lowDone = lowTasks.filter((t) => t.status === 'Done').length;
        const lowRate = lowTasks.length > 0 ? Math.round((lowDone / lowTasks.length) * 100) : 0;

        // Productivity Index Calculation (0 - 100)
        let productivityScore = 0;
        if (total > 0) {
            const completionPart = (completed / total) * 50; // max 50 pts
            const overduePenalty = total > 0 ? (overdueTasks.length / total) * 30 : 0;
            const onTimePart = Math.max(0, 30 - overduePenalty); // max 30 pts
            const progressPart = (inProgress / total) * 20; // max 20 pts
            productivityScore = Math.min(100, Math.round(completionPart + onTimePart + progressPart));
        }

        let scoreBadge = { label: 'Getting Started', color: 'bg-gray-100 text-gray-800 border-gray-200' };
        if (total > 0) {
            if (productivityScore >= 80) {
                scoreBadge = { label: 'Outstanding 🚀', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
            } else if (productivityScore >= 60) {
                scoreBadge = { label: 'Great Momentum ⚡', color: 'bg-blue-100 text-blue-800 border-blue-300' };
            } else if (productivityScore >= 40) {
                scoreBadge = { label: 'On Track 📈', color: 'bg-amber-100 text-amber-800 border-amber-300' };
            } else {
                scoreBadge = { label: 'Needs Focus 🎯', color: 'bg-rose-100 text-rose-800 border-rose-300' };
            }
        }

        // Smart Insights Engine
        const insights: { type: 'success' | 'warning' | 'info'; title: string; text: string }[] = [];

        if (total === 0) {
            insights.push({
                type: 'info',
                title: 'No Data Yet',
                text: 'Create your first tasks on the dashboard to unlock comprehensive analytics and productivity scores.',
            });
        } else {
            if (overdueTasks.length > 0) {
                insights.push({
                    type: 'warning',
                    title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
                    text: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past their due date. Prioritizing these will significantly raise your productivity score.`,
                });
            } else {
                insights.push({
                    type: 'success',
                    title: 'Clean Timelines!',
                    text: 'Zero overdue tasks. You are staying right on schedule with your deliverables.',
                });
            }

            if (highTasks.length > 0 && highRate < 50) {
                insights.push({
                    type: 'warning',
                    title: 'High Priority Attention',
                    text: `Only ${highRate}% of your high-priority tasks are completed (${highDone}/${highTasks.length}). Focus high-impact tasks first.`,
                });
            } else if (highTasks.length > 0 && highRate >= 70) {
                insights.push({
                    type: 'success',
                    title: 'High Impact Execution',
                    text: `${highRate}% of high-priority tasks completed! Excellent focus on critical work.`,
                });
            }

            if (inProgress > 0 && inProgress <= 4) {
                insights.push({
                    type: 'info',
                    title: 'Balanced Work in Progress',
                    text: `You have ${inProgress} task${inProgress > 1 ? 's' : ''} actively in progress. This is an ideal flow state with minimal multitasking overhead.`,
                });
            } else if (inProgress > 4) {
                insights.push({
                    type: 'warning',
                    title: 'High Work in Progress',
                    text: `You have ${inProgress} tasks simultaneously in progress. Consider finishing active items before starting new ones.`,
                });
            }

            if (completionRate >= 80) {
                insights.push({
                    type: 'success',
                    title: 'High Completion Efficiency',
                    text: `You have completed ${completionRate}% of all tasks in this period. Outstanding execution!`,
                });
            }
        }

        return {
            total,
            completed,
            inProgress,
            todo,
            completionRate,
            inProgressRate,
            todoRate,
            overdueTasks,
            dueTodayTasks,
            upcomingTasks,
            highTasks,
            highDone,
            highRate,
            mediumTasks,
            mediumDone,
            mediumRate,
            lowTasks,
            lowDone,
            lowRate,
            productivityScore,
            scoreBadge,
            insights,
        };
    }, [filteredTasks]);

    // Urgent focus list (overdue tasks first, then due today, then high priority in progress)
    const urgentFocusTasks = useMemo(() => {
        const list = [...filteredTasks.filter((t) => t.status !== 'Done')];
        list.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
        });
        return list.slice(0, 5);
    }, [filteredTasks]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Analytics & Insights
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Productivity Overview</h1>
                        <p className="text-sm text-gray-500">
                            Actionable analytics, completion trends, and workload distribution
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Time Range Selector */}
                        <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center space-x-1 shadow-sm">
                            <button
                                onClick={() => setTimeRange('7days')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    timeRange === '7days'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Last 7 Days
                            </button>
                            <button
                                onClick={() => setTimeRange('30days')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    timeRange === '30days'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Last 30 Days
                            </button>
                            <button
                                onClick={() => setTimeRange('all')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    timeRange === 'all'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                All Time
                            </button>
                        </div>

                        <Link
                            to="/"
                            className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center space-x-1.5"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Tasks</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                        <p className="text-sm text-gray-500">Calculating your productivity analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Top KPI Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {/* Productivity Score */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Productivity Index
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${metrics.scoreBadge.color}`}>
                                        {metrics.scoreBadge.label}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-baseline space-x-2">
                                    <span className="text-3xl font-extrabold text-gray-900">
                                        {metrics.productivityScore}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">/ 100</span>
                                </div>
                                <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
                                        style={{ width: `${metrics.productivityScore}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Composite score of completion & velocity
                                </p>
                            </div>

                            {/* Total Tasks */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Total Tasks
                                    </span>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{metrics.total}</span>
                                </div>
                                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-2">
                                    <span className="font-medium text-emerald-600">{metrics.completed} completed</span>
                                    <span>•</span>
                                    <span className="font-medium text-amber-600">{metrics.inProgress} in flight</span>
                                </div>
                            </div>

                            {/* Completion Rate */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Completion Rate
                                    </span>
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-baseline space-x-2">
                                    <span className="text-3xl font-extrabold text-gray-900">
                                        {metrics.completionRate}%
                                    </span>
                                </div>
                                <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                                        style={{ width: `${metrics.completionRate}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {metrics.completed} of {metrics.total} tasks resolved
                                </p>
                            </div>

                            {/* Overdue Items */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Overdue Items
                                    </span>
                                    <div className={`p-2 rounded-lg ${metrics.overdueTasks.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-baseline space-x-2">
                                    <span className={`text-3xl font-extrabold ${metrics.overdueTasks.length > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                        {metrics.overdueTasks.length}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {metrics.total > 0
                                            ? `(${Math.round((metrics.overdueTasks.length / metrics.total) * 100)}% of total)`
                                            : ''}
                                    </span>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">
                                    {metrics.overdueTasks.length === 0
                                        ? 'All tasks are on track'
                                        : 'Requires immediate attention'}
                                </p>
                            </div>
                        </div>

                        {/* Main Charts & Visual Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Status Breakdown Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-gray-900">Status Distribution</h2>
                                    <span className="text-xs text-gray-500">{metrics.total} total</span>
                                </div>

                                <div className="space-y-4">
                                    {/* Done */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-medium text-emerald-800 flex items-center space-x-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                                                <span>Done</span>
                                            </span>
                                            <span className="text-gray-600 font-semibold">
                                                {metrics.completed} ({metrics.completionRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.completionRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* In Progress */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-medium text-amber-800 flex items-center space-x-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                                                <span>In Progress</span>
                                            </span>
                                            <span className="text-gray-600 font-semibold">
                                                {metrics.inProgress} ({metrics.inProgressRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.inProgressRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* To Do */}
                                    <div>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="font-medium text-slate-800 flex items-center space-x-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                                                <span>To Do</span>
                                            </span>
                                            <span className="text-gray-600 font-semibold">
                                                {metrics.todo} ({metrics.todoRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-slate-400 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.todoRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Active Execution</span>
                                    <span className="font-semibold text-gray-800">
                                        {metrics.inProgress + metrics.completed} / {metrics.total} started
                                    </span>
                                </div>
                            </div>

                            {/* Priority Matrix Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-gray-900">Priority Completion</h2>
                                    <span className="text-xs text-gray-500">By impact level</span>
                                </div>

                                <div className="space-y-4">
                                    {/* High Priority */}
                                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                                        <div className="flex justify-between items-center text-xs font-semibold text-rose-900 mb-1">
                                            <span className="flex items-center space-x-1">
                                                <span>High Priority</span>
                                                <span className="text-xs bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded">
                                                    {metrics.highTasks.length}
                                                </span>
                                            </span>
                                            <span>
                                                {metrics.highDone}/{metrics.highTasks.length} ({metrics.highRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-rose-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.highRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Medium Priority */}
                                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                                        <div className="flex justify-between items-center text-xs font-semibold text-amber-900 mb-1">
                                            <span className="flex items-center space-x-1">
                                                <span>Medium Priority</span>
                                                <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded">
                                                    {metrics.mediumTasks.length}
                                                </span>
                                            </span>
                                            <span>
                                                {metrics.mediumDone}/{metrics.mediumTasks.length} ({metrics.mediumRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.mediumRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Low Priority */}
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                                        <div className="flex justify-between items-center text-xs font-semibold text-blue-900 mb-1">
                                            <span className="flex items-center space-x-1">
                                                <span>Low Priority</span>
                                                <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded">
                                                    {metrics.lowTasks.length}
                                                </span>
                                            </span>
                                            <span>
                                                {metrics.lowDone}/{metrics.lowTasks.length} ({metrics.lowRate}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${metrics.lowRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule & Timeliness Health */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-base font-semibold text-gray-900">Deadline Health</h2>
                                        <span className="text-xs text-gray-500">Timeline tracking</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center mb-5">
                                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                                            <div className="text-lg font-bold text-rose-700">
                                                {metrics.overdueTasks.length}
                                            </div>
                                            <div className="text-xs font-medium text-rose-600 mt-0.5">Overdue</div>
                                        </div>

                                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                                            <div className="text-lg font-bold text-amber-700">
                                                {metrics.dueTodayTasks.length}
                                            </div>
                                            <div className="text-xs font-medium text-amber-600 mt-0.5">Due Today</div>
                                        </div>

                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                            <div className="text-lg font-bold text-emerald-700">
                                                {metrics.upcomingTasks.length}
                                            </div>
                                            <div className="text-xs font-medium text-emerald-600 mt-0.5">Upcoming</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs text-gray-600">
                                        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                            <span>Active On-Schedule Rate</span>
                                            <span className="font-semibold text-emerald-600">
                                                {metrics.total > 0
                                                    ? `${Math.max(0, 100 - Math.round((metrics.overdueTasks.length / metrics.total) * 100))}%`
                                                    : '100%'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5">
                                            <span>Tasks without Overdue Drag</span>
                                            <span className="font-semibold text-gray-900">
                                                {metrics.total - metrics.overdueTasks.length} / {metrics.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <Link
                                        to="/"
                                        className="w-full block text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200"
                                    >
                                        Filter & Manage in Task Board →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Smart Recommendations & Urgent Focus Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Smart Productivity Insights Engine */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-semibold text-gray-900">Productivity Insights & Recommendations</h2>
                                </div>

                                <div className="space-y-3">
                                    {metrics.insights.map((insight, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                                                insight.type === 'warning'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                    : insight.type === 'success'
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    : 'bg-blue-50 border-blue-200 text-blue-900'
                                            }`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {insight.type === 'warning' && (
                                                    <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                )}
                                                {insight.type === 'success' && (
                                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                                {insight.type === 'info' && (
                                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold">{insight.title}</h3>
                                                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{insight.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Urgent Focus Tasks List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-base font-semibold text-gray-900">Action Focus (Needs Attention)</h2>
                                    </div>
                                    <Link to="/" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                        View All Tasks →
                                    </Link>
                                </div>

                                {urgentFocusTasks.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-500">🎉 No urgent or overdue pending tasks!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {urgentFocusTasks.map((task) => {
                                            const isOverdue =
                                                task.dueDate &&
                                                new Date(task.dueDate) < new Date() &&
                                                task.status !== 'Done';

                                            return (
                                                <div
                                                    key={task._id}
                                                    className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-lg border border-gray-200 flex items-center justify-between transition-colors gap-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span
                                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                                                    task.priority === 'High'
                                                                        ? 'bg-rose-100 text-rose-700'
                                                                        : task.priority === 'Medium'
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                            <h4 className="text-xs font-semibold text-gray-900 truncate">
                                                                {task.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-gray-500">
                                                            <span>Status: <span className="font-medium text-gray-700">{task.status}</span></span>
                                                            {task.dueDate && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className={isOverdue ? 'text-rose-600 font-semibold' : ''}>
                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                        {isOverdue && ' (Overdue)'}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-1.5 shrink-0">
                                                        {task.status !== 'Done' && (
                                                            <button
                                                                onClick={() => handleStatusChange(task._id, 'Done')}
                                                                title="Mark as Done"
                                                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-sm transition-colors"
                                                            >
                                                                Mark Done
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AnalyticsPage;
