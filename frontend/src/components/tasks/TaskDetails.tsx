import React from 'react';
import type { Task } from '../../types';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/helpers';

interface TaskDetailsProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onToggleSubtask?: (taskId: string, subtaskId?: string, index?: number) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, isOpen, onClose, onToggleSubtask }) => {
    if (!isOpen || !task) return null;

    const subtasks = task.subtasks || [];
    const completedCount = subtasks.filter((s) => s.isCompleted).length;
    const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 p-6 my-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">{task.title}</h2>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none p-1 rounded-lg transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority} Priority
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                    </span>
                </div>

                <div className="text-sm text-gray-700 mb-5 whitespace-pre-wrap leading-relaxed bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                    {task.description || 'No description provided.'}
                </div>

                {/* Subtasks / Checklist */}
                {subtasks.length > 0 && (
                    <div className="mb-5 bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Checklist</span>
                            </h4>
                            <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                                {completedCount} of {subtasks.length} ({progressPercent}%)
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {subtasks.map((sub, index) => (
                                <label
                                    key={sub._id || sub.id || index}
                                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={sub.isCompleted}
                                        onChange={() => {
                                            if (onToggleSubtask) {
                                                onToggleSubtask(task._id, sub._id, index);
                                            }
                                        }}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                    />
                                    <span className={`text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                                        {sub.title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500 space-y-1.5 pt-3 border-t border-gray-100">
                    <p className="flex justify-between">
                        <span>Due Date:</span>
                        <span className="font-semibold text-gray-700">{formatDate(task.dueDate)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Created At:</span>
                        <span className="font-semibold text-gray-700">{formatDate(task.createdAt)}</span>
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
