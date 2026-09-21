import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import TaskList from '../components/tasks/TaskList';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import TaskStats from '../components/tasks/TaskStats';
import ExportDropdown from '../components/tasks/ExportDropdown';
import api from '../services/api';
import type { Task, TaskFormData } from '../types';

type ViewMode = 'list' | 'kanban';

const DashboardPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // View Mode (List or Kanban Board)
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('task_view_mode') as ViewMode;
        return saved === 'kanban' ? 'kanban' : 'list';
    });

    const handleViewChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('task_view_mode', mode);
    };

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [dueDateFilter, setDueDateFilter] = useState('All');
    const [customDueDate, setCustomDueDate] = useState('');
    const [sortBy, setSortBy] = useState('createdAt-desc');

    // Modal & Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [defaultTaskStatus, setDefaultTaskStatus] = useState<Task['status']>('To Do');

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

    const handleStatusChange = async (id: string, status: Task['status']) => {
        try {
            // Optimistic update
            setTasks((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status } : t))
            );
            await api.put(`/tasks/${id}`, { status });
            toast.success(`Task moved to ${status}`);
        } catch (err: any) {
            // Revert by re-fetching on error
            fetchTasks();
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleOpenCreate = (status: Task['status'] = 'To Do') => {
        setEditingTask(null);
        setDefaultTaskStatus(status);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('All');
        setPriorityFilter('All');
        setDueDateFilter('All');
        setCustomDueDate('');
        setSortBy('createdAt-desc');
    };

    const filteredAndSortedTasks = useMemo(() => {
        const filtered = tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

            const matchesDueDate = (() => {
                if (dueDateFilter === 'All') return true;
                if (!task.dueDate) return true;

                const taskDate = new Date(task.dueDate);
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

                if (dueDateFilter === 'Overdue') {
                    return taskDate < todayStart && task.status !== 'Done';
                }
                if (dueDateFilter === 'Today') {
                    return taskDate >= todayStart && taskDate <= todayEnd;
                }
                if (dueDateFilter === 'Upcoming') {
                    return taskDate > todayEnd;
                }
                if (dueDateFilter === 'Custom' && customDueDate) {
                    const selected = new Date(customDueDate);
                    const selStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0, 0);
                    const selEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
                    return taskDate >= selStart && taskDate <= selEnd;
                }
                return true;
            })();

            return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
        });

        const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'createdAt-asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'createdAt-desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'dueDate-asc': {
                    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    return da - db;
                }
                case 'dueDate-desc': {
                    const da = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
                    const db = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
                    return db - da;
                }
                case 'priority-desc':
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                case 'priority-asc':
                    return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }, [tasks, search, statusFilter, priorityFilter, dueDateFilter, customDueDate, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Title and Global Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage and track your active tasks</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* View Switcher (List vs Kanban) */}
                        <div className="inline-flex items-center bg-gray-200/90 p-1 rounded-xl border border-gray-200 shadow-xs">
                            <button
                                type="button"
                                onClick={() => handleViewChange('list')}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Switch to List View"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span>List</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleViewChange('kanban')}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    viewMode === 'kanban'
                                        ? 'bg-white text-blue-600 shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Switch to Kanban Board View"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                                <span>Kanban</span>
                            </button>
                        </div>

                        <ExportDropdown filteredTasks={filteredAndSortedTasks} allTasks={tasks} />

                        <button
                            onClick={() => handleOpenCreate('To Do')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>

                <TaskStats tasks={tasks} />

                <TaskFilters
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityChange={setPriorityFilter}
                    dueDateFilter={dueDateFilter}
                    onDueDateChange={setDueDateFilter}
                    customDueDate={customDueDate}
                    onCustomDueDateChange={setCustomDueDate}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalTasks={tasks.length}
                    filteredCount={filteredAndSortedTasks.length}
                    onResetFilters={handleResetFilters}
                />

                {viewMode === 'list' ? (
                    <TaskList
                        tasks={filteredAndSortedTasks}
                        loading={loading}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <KanbanBoard
                        tasks={filteredAndSortedTasks}
                        loading={loading}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        onAddTask={(status) => handleOpenCreate(status || 'To Do')}
                    />
                )}
            </main>

            <TaskForm
                isOpen={isFormOpen}
                initialData={editingTask}
                defaultStatus={defaultTaskStatus}
                onSubmit={handleCreateTask}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditingTask(null);
                }}
            />
        </div>
    );
};

export default DashboardPage;
