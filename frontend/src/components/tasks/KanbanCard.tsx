import React from 'react';
import type { Task } from '../../types';
import { formatDate, getPriorityBadgeClass } from '../../utils/helpers';

interface KanbanCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
    isDragging?: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
    task,
    onEdit,
    onDelete,
    onStatusChange,
    isDragging,
    onDragStart,
    onDragEnd,
}) => {
    // Due date urgency calculation
    const getDueDateBadge = () => {
        if (!task.dueDate) return null;
        const taskDate = new Date(task.dueDate);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const isOverdue = taskDate < todayStart && task.status !== 'Done';
        const isToday = taskDate >= todayStart && taskDate <= todayEnd;

        if (isOverdue) {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Overdue: {formatDate(task.dueDate)}
                </span>
            );
        }

        if (isToday) {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Due Today
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
            </span>
        );
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task)}
            onDragEnd={onDragEnd}
            className={`group bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                isDragging ? 'opacity-40 scale-95 border-dashed border-blue-400 shadow-none' : ''
            }`}
        >
            {/* Top row: Priority & Drag Handle */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(
                        task.priority
                    )}`}
                >
                    {task.priority}
                </span>

                <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit task"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task._id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete task"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <div className="text-gray-300 ml-0.5 cursor-grab" title="Drag to reorder/move">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16 16a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Task Title */}
            <h4 className="font-semibold text-gray-900 text-sm mb-1.5 leading-snug line-clamp-2">
                {task.title}
            </h4>

            {/* Task Description */}
            {task.description && (
                <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Due date info */}
            <div className="mb-3">{getDueDateBadge()}</div>

            {/* Quick Stage Transitions Footer */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400 font-medium">Move to:</span>
                <div className="flex items-center gap-1">
                    {task.status !== 'To Do' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task._id, 'To Do');
                            }}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                            title="Move back to To Do"
                        >
                            To Do
                        </button>
                    )}
                    {task.status !== 'In Progress' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task._id, 'In Progress');
                            }}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                            title="Move to In Progress"
                        >
                            In Progress
                        </button>
                    )}
                    {task.status !== 'Done' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task._id, 'Done');
                            }}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-0.5"
                            title="Mark as Done"
                        >
                            <span>✓</span> Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanCard;
