import React from 'react';
import type { Task } from '../../types';

interface TaskStatsProps {
    tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Task Progress</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {total === 0
                            ? 'No tasks created yet'
                            : `${completed} of ${total} tasks completed (${percentage}%)`}
                    </p>
                </div>

                {/* Quick stats pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        Total: <span className="font-bold">{total}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        To Do: <span className="font-bold">{todo}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress: <span className="font-bold">{inProgress}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Done: <span className="font-bold">{completed}</span>
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
};

export default TaskStats;
