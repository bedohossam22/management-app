import React, { useState, useMemo } from 'react';
import type { Task } from '../../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
    tasks: Task[];
    loading?: boolean;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
    onAddTask: (status?: Task['status']) => void;
    onDuplicate?: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    loading = false,
    onEdit,
    onDelete,
    onStatusChange,
    onAddTask,
    onDuplicate,
}) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Split tasks into 3 status columns
    const columnsData = useMemo(() => {
        const toDo = tasks.filter((t) => t.status === 'To Do');
        const inProgress = tasks.filter((t) => t.status === 'In Progress');
        const done = tasks.filter((t) => t.status === 'Done');

        return {
            'To Do': toDo,
            'In Progress': inProgress,
            'Done': done,
        };
    }, [tasks]);

    const handleCardDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        setDraggedTaskId(task._id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task._id);
    };

    const handleCardDragEnd = () => {
        setDraggedTaskId(null);
    };

    const handleDropTask = (e: React.DragEvent<HTMLDivElement>, targetStatus: Task['status']) => {
        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
        if (!taskId) return;

        const task = tasks.find((t) => t._id === taskId);
        if (task && task.status !== targetStatus) {
            onStatusChange(taskId, targetStatus);
        }
        setDraggedTaskId(null);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((col) => (
                    <div key={col} className="bg-gray-100 rounded-2xl p-4 min-h-[450px]">
                        <div className="h-7 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-28 bg-gray-200 rounded-xl"></div>
                            <div className="h-28 bg-gray-200 rounded-xl"></div>
                            <div className="h-28 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <KanbanColumn
                title="To Do"
                status="To Do"
                tasks={columnsData['To Do']}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onAddTask={onAddTask}
                onDuplicate={onDuplicate}
                draggedTaskId={draggedTaskId}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
                onDropTask={handleDropTask}
            />

            <KanbanColumn
                title="In Progress"
                status="In Progress"
                tasks={columnsData['In Progress']}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onAddTask={onAddTask}
                onDuplicate={onDuplicate}
                draggedTaskId={draggedTaskId}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
                onDropTask={handleDropTask}
            />

            <KanbanColumn
                title="Done"
                status="Done"
                tasks={columnsData['Done']}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onAddTask={onAddTask}
                onDuplicate={onDuplicate}
                draggedTaskId={draggedTaskId}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
                onDropTask={handleDropTask}
            />
        </div>
    );
};

export default KanbanBoard;
