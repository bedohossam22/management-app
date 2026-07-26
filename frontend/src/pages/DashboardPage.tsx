import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import api from '../services/api';
import type { Task, TaskFormData } from '../types';

const DashboardPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    // Modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/tasks');
            const data = response.data.data || response.data;
            setTasks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch tasks');
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
            } else {
                await api.post('/tasks', formData);
            }
            setIsFormOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save task');
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleStatusChange = async (id: string, status: Task['status']) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            setTasks((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status } : t))
            );
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleOpenCreate = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage and track your active tasks</p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2"
                    >
                        <span>+ Add Task</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <TaskFilters
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityChange={setPriorityFilter}
                />

                <TaskList
                    tasks={filteredTasks}
                    loading={loading}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                />
            </main>

            <TaskForm
                isOpen={isFormOpen}
                initialData={editingTask}
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
