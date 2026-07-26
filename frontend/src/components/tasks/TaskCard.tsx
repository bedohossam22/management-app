import React from 'react';
import type { Task } from '../../types';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/helpers';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{task.title}</h3>
                <div className="flex items-center space-x-2">
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getPriorityBadgeClass(
                            task.priority
                        )}`}
                    >
                        {task.priority}
                    </span>
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusBadgeClass(
                            task.status
                        )}`}
                    >
                        {task.status}
                    </span>
                </div>
            </div>

            {task.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div>
                    Due: <span className="font-medium text-gray-700">{formatDate(task.dueDate)}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value as Task['status'])}
                        className="text-xs bg-gray-50 border border-gray-300 rounded px-2 pr-7 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>

                    <button
                        onClick={() => onEdit(task)}
                        className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        className="text-red-600 hover:text-red-800 font-medium px-2 py-1"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
