import React from 'react';
import type { Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
    tasks: Task[];
    loading: boolean;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    loading,
    onEdit,
    onDelete,
    onStatusChange,
}) => {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500 text-sm">Loading tasks...</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12 px-4">
                <p className="text-gray-500 font-medium text-base">No tasks found.</p>
                <p className="text-gray-400 text-sm mt-1">Create a new task to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
                <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            ))}
        </div>
    );
};

export default TaskList;
