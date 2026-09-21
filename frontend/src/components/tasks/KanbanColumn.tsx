import React, { useState } from 'react';
import type { Task } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    title: Task['status'];
    status: Task['status'];
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
    onAddTask: (status: Task['status']) => void;
    draggedTaskId: string | null;
    onCardDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onCardDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDropTask: (e: React.DragEvent<HTMLDivElement>, targetStatus: Task['status']) => void;
}

const statusConfig: Record<
    Task['status'],
    {
        iconBg: string;
        textColor: string;
        badgeBg: string;
        borderColor: string;
        activeBorder: string;
        accentColor: string;
        icon: React.ReactNode;
        emptyText: string;
    }
> = {
    'To Do': {
        iconBg: 'bg-purple-100 text-purple-600',
        textColor: 'text-purple-950',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        borderColor: 'border-purple-200/80',
        activeBorder: 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-200',
        accentColor: 'bg-purple-500',
        emptyText: 'No tasks waiting to start',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
    },
    'In Progress': {
        iconBg: 'bg-blue-100 text-blue-600',
        textColor: 'text-blue-950',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        borderColor: 'border-blue-200/80',
        activeBorder: 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-200',
        accentColor: 'bg-blue-500',
        emptyText: 'No tasks currently in progress',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    'Done': {
        iconBg: 'bg-emerald-100 text-emerald-600',
        textColor: 'text-emerald-950',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        borderColor: 'border-emerald-200/80',
        activeBorder: 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200',
        accentColor: 'bg-emerald-500',
        emptyText: 'No completed tasks yet',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    title,
    status,
    tasks,
    onEdit,
    onDelete,
    onStatusChange,
    onAddTask,
    draggedTaskId,
    onCardDragStart,
    onCardDragEnd,
    onDropTask,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const config = statusConfig[status];

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // Prevent flickering when hovering child elements
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        onDropTask(e, status);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col bg-gray-100/80 rounded-2xl p-3 sm:p-4 border transition-all duration-200 min-h-[480px] ${
                isDragOver ? config.activeBorder : `${config.borderColor} shadow-xs`
            }`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                        {config.icon}
                    </div>
                    <h3 className={`font-bold text-base ${config.textColor}`}>{title}</h3>
                    <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${config.badgeBg}`}
                    >
                        {tasks.length}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => onAddTask(status)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-xs"
                    title={`Add task to ${title}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 max-h-[calc(100vh-280px)] min-h-[120px]">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <KanbanCard
                            key={task._id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            isDragging={draggedTaskId === task._id}
                            onDragStart={onCardDragStart}
                            onDragEnd={onCardDragEnd}
                        />
                    ))
                ) : (
                    <div
                        className={`h-full min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-colors ${
                            isDragOver
                                ? 'border-blue-400 bg-blue-50/50 text-blue-600'
                                : 'border-gray-300/80 text-gray-400'
                        }`}
                    >
                        <p className="text-xs font-medium text-gray-500 mb-2">{config.emptyText}</p>
                        <button
                            type="button"
                            onClick={() => onAddTask(status)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                            + Create a task
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
