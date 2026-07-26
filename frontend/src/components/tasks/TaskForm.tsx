import React, { useState, useEffect } from 'react';
import type { Task, TaskFormData } from '../../types';

interface TaskFormProps {
    initialData?: Task | null;
    onSubmit: (formData: TaskFormData) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isOpen }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('To Do');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setStatus(initialData.status);
            setPriority(initialData.priority);
            setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
        } else {
            setTitle('');
            setDescription('');
            setStatus('To Do');
            setPriority('Medium');
            setDueDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({ title, description, status, priority, dueDate });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter task title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter task description (optional)"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Task['status'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskForm;
