import React, { useState, useEffect } from 'react';
import type { Task, TaskFormData, Subtask, Note } from '../../types';
import TaskNotes from './TaskNotes';

interface TaskFormProps {
    initialData?: Task | null;
    defaultStatus?: Task['status'];
    defaultDueDate?: string;
    onSubmit: (formData: TaskFormData) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
    onTaskUpdate?: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, defaultStatus, defaultDueDate, onSubmit, onCancel, isOpen, onTaskUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('To Do');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [dueDate, setDueDate] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setStatus(initialData.status);
            setPriority(initialData.priority);
            setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
            setSubtasks(Array.isArray(initialData.subtasks) ? [...initialData.subtasks] : []);
            setNotes(Array.isArray(initialData.notes) ? [...initialData.notes] : []);
        } else {
            setTitle('');
            setDescription('');
            setStatus(defaultStatus || 'To Do');
            setPriority('Medium');
            setDueDate(defaultDueDate || new Date().toISOString().split('T')[0]);
            setSubtasks([]);
            setNotes([]);
        }
        setNewSubtaskTitle('');
    }, [initialData, defaultStatus, defaultDueDate, isOpen]);

    if (!isOpen) return null;

    const handleAddSubtask = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newSubtaskTitle.trim();
        if (!trimmed) return;

        setSubtasks((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substring(2, 9),
                title: trimmed,
                isCompleted: false,
            },
        ]);
        setNewSubtaskTitle('');
    };

    const handleToggleSubtask = (index: number) => {
        setSubtasks((prev) =>
            prev.map((sub, i) => (i === index ? { ...sub, isCompleted: !sub.isCompleted } : sub))
        );
    };

    const handleUpdateSubtaskTitle = (index: number, newTitle: string) => {
        setSubtasks((prev) =>
            prev.map((sub, i) => (i === index ? { ...sub, title: newTitle } : sub))
        );
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddQuickPresets = (presetItems: string[]) => {
        const newItems: Subtask[] = presetItems.map((itemTitle) => ({
            id: Math.random().toString(36).substring(2, 9),
            title: itemTitle,
            isCompleted: false,
        }));
        setSubtasks((prev) => [...prev, ...newItems]);
    };

    const completedCount = subtasks.filter((s) => s.isCompleted).length;
    const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({ title, description, status, priority, dueDate, subtasks });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 my-8">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {initialData ? 'Edit Task' : 'Create New Task'}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        type="button"
                        className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-xs"
                            placeholder="e.g., Redesign landing page banner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all shadow-xs resize-none"
                            placeholder="Add any extra context or details (optional)"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Task['status'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-xs"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-xs"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                                Due Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Subtasks & Checklist Section */}
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Subtasks & Checklist</span>
                            </label>

                            {subtasks.length > 0 && (
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                    {completedCount} of {subtasks.length} ({progressPercent}%)
                                </span>
                            )}
                        </div>

                        {/* Progress Bar if subtasks exist */}
                        {subtasks.length > 0 && (
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        )}

                        {/* Subtasks List */}
                        <div className="space-y-2 mb-3">
                            {subtasks.map((subtask, index) => (
                                <div
                                    key={subtask._id || subtask.id || index}
                                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                                        subtask.isCompleted
                                            ? 'bg-emerald-50/50 border-emerald-100 text-gray-500'
                                            : 'bg-gray-50/70 border-gray-200 text-gray-800'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={subtask.isCompleted}
                                        onChange={() => handleToggleSubtask(index)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                    />
                                    <input
                                        type="text"
                                        value={subtask.title}
                                        onChange={(e) => handleUpdateSubtaskTitle(index, e.target.value)}
                                        className={`flex-1 bg-transparent text-sm focus:outline-none ${
                                            subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium'
                                        }`}
                                        placeholder="Subtask name..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSubtask(index)}
                                        className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                        title="Remove subtask"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Subtask Input Field */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubtask();
                                    }
                                }}
                                placeholder="Add a subtask (press Enter)..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-xs bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => handleAddSubtask()}
                                disabled={!newSubtaskTitle.trim()}
                                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add</span>
                            </button>
                        </div>

                        {/* Quick Presets */}
                        {subtasks.length === 0 && (
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-xs text-gray-500">
                                <span className="font-medium text-gray-400">Presets:</span>
                                <button
                                    type="button"
                                    onClick={() => handleAddQuickPresets(['Research & Planning', 'Development', 'Testing & Review', 'Deployment'])}
                                    className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-[11px] cursor-pointer"
                                >
                                    + Dev Sprint (4 steps)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddQuickPresets(['Draft Outline', 'Internal Review', 'Final Approval'])}
                                    className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-[11px] cursor-pointer"
                                >
                                    + Review Flow (3 steps)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Activity Log / Notes Section — only for existing tasks */}
                    {initialData && initialData._id && (
                        <TaskNotes
                            taskId={initialData._id}
                            notes={notes}
                            onNotesUpdate={(updatedNotes) => {
                                setNotes(updatedNotes);
                                if (onTaskUpdate && initialData) {
                                    onTaskUpdate({ ...initialData, notes: updatedNotes });
                                }
                            }}
                        />
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
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
