import React from 'react';

interface TaskFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusChange: (val: string) => void;
    priorityFilter: string;
    onPriorityChange: (val: string) => void;
    dueDateFilter: string;
    onDueDateChange: (val: string) => void;
    customDueDate: string;
    onCustomDueDateChange: (val: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    priorityFilter,
    onPriorityChange,
    dueDateFilter,
    onDueDateChange,
    customDueDate,
    onCustomDueDateChange,
}) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => onPriorityChange(e.target.value)}
                    className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <select
                    value={dueDateFilter}
                    onChange={(e) => onDueDateChange(e.target.value)}
                    className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="All">All Due Dates</option>
                    <option value="Today">Due Today</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Custom">Specific Date</option>
                </select>

                {dueDateFilter === 'Custom' && (
                    <input
                        type="date"
                        value={customDueDate}
                        onChange={(e) => onCustomDueDateChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                )}
            </div>
        </div>
    );
};

export default TaskFilters;
