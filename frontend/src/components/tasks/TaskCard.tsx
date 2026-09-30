import React, { useState } from 'react';
import type { Task } from '../../types';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/helpers';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
    onDuplicate?: (task: Task) => void;
    onToggleSubtask?: (taskId: string, subtaskId?: string, index?: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onEdit,
    onDelete,
    onStatusChange,
    onDuplicate,
    onToggleSubtask,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const subtasks = task.subtasks || [];
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-2.5">
                    <h3
                        className="font-bold text-gray-900 text-base leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={() => onEdit(task)}
                    >
                        {task.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 shrink-0">
                        <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getPriorityBadgeClass(
                                task.priority
                            )}`}
                        >
                            {task.priority}
                        </span>
                        <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadgeClass(
                                task.status
                            )}`}
                        >
                            {task.status}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-gray-600 text-sm mb-3.5 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Subtasks Progress Bar & Quick View */}
                {totalSubtasks > 0 && (
                    <div className="mb-4 bg-gray-50/90 rounded-xl p-2.5 border border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90 text-blue-600' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                                <span>Checklist</span>
                            </button>

                            <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                    completedSubtasks === totalSubtasks
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-blue-100/70 text-blue-800'
                                }`}
                            >
                                {completedSubtasks}/{totalSubtasks} ({progressPercent}%)
                            </span>
                        </div>

                        {/* Progress meter bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>

                        {/* Expandable Subtask List */}
                        {isExpanded && (
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 space-y-1.5">
                                {subtasks.map((sub, idx) => (
                                    <label
                                        key={sub._id || sub.id || idx}
                                        className="flex items-center gap-2 text-xs text-gray-700 hover:bg-gray-100/70 p-1 rounded cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={sub.isCompleted}
                                            onChange={() => {
                                                if (onToggleSubtask) {
                                                    onToggleSubtask(task._id, sub._id, idx);
                                                }
                                            }}
                                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                                        />
                                        <span className={sub.isCompleted ? 'line-through text-gray-400 font-normal' : 'font-medium text-gray-800'}>
                                            {sub.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(task.dueDate)}</span>
                    </div>
                    {task.notes && task.notes.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-600" title={`${task.notes.length} note${task.notes.length === 1 ? '' : 's'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-[11px] font-medium">{task.notes.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-1 sm:space-x-1.5">
                    <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 pr-6 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>

                    {onDuplicate && (
                        <button
                            type="button"
                            onClick={() => onDuplicate(task)}
                            className="text-gray-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate task"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    )}

                    <button
                        onClick={() => onEdit(task)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors font-semibold cursor-pointer"
                        title="Edit task"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete task"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
