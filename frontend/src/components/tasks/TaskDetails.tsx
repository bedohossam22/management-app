import React from 'react';
import type { Task } from '../../types';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/helpers';

interface TaskDetailsProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, isOpen, onClose }) => {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority} Priority
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                    </span>
                </div>

                <div className="text-sm text-gray-600 mb-6 whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                </div>

                <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-100">
                    <p>Due Date: <span className="font-medium text-gray-700">{formatDate(task.dueDate)}</span></p>
                    <p>Created At: <span className="font-medium text-gray-700">{formatDate(task.createdAt)}</span></p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
