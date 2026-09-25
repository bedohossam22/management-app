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
    sortBy: string;
    onSortChange: (val: string) => void;
    totalTasks?: number;
    filteredCount?: number;
    onResetFilters?: () => void;
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
    sortBy,
    onSortChange,
    totalTasks = 0,
    filteredCount = 0,
    onResetFilters,
}) => {
    const hasActiveFilters =
        Boolean(search) ||
        statusFilter !== 'All' ||
        priorityFilter !== 'All' ||
        dueDateFilter !== 'All' ||
        Boolean(customDueDate) ||
        sortBy !== 'createdAt-desc';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:flex-1 relative">
                    <input
                        id="task-search-input"
                        type="text"
                        placeholder="Search tasks by title or description... (Press / to focus)"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-14 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                        className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="absolute right-2.5 top-2 flex items-center space-x-1">
                        {search ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="text-gray-400 hover:text-gray-600 p-0.5"
                                title="Clear search"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        ) : (
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded font-mono">
                                /
                            </kbd>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap w-full sm:w-auto items-center gap-2.5">
                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Filter by status"
                    >
                        <option value="All">All Statuses</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>

                    {/* Priority filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Filter by priority"
                    >
                        <option value="All">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>

                    {/* Due Date filter */}
                    <select
                        value={dueDateFilter}
                        onChange={(e) => onDueDateChange(e.target.value)}
                        className="px-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Filter by due date"
                    >
                        <option value="All">All Due Dates</option>
                        <option value="Today">Due Today</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Custom">Specific Date</option>
                    </select>

                    {/* Sort by */}
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-3 pr-8 py-2 border border-blue-200 bg-blue-50/50 text-blue-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        title="Sort tasks"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="dueDate-asc">Due Date (Soonest)</option>
                        <option value="dueDate-desc">Due Date (Furthest)</option>
                        <option value="priority-desc">Priority (High to Low)</option>
                        <option value="priority-asc">Priority (Low to High)</option>
                        <option value="title-asc">Title (A - Z)</option>
                        <option value="title-desc">Title (Z - A)</option>
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

            {/* Filter Summary & Quick Reset */}
            {hasActiveFilters && (
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                    <div>
                        Showing <span className="font-semibold text-gray-800">{filteredCount}</span> of{' '}
                        <span className="font-semibold text-gray-800">{totalTasks}</span> tasks
                    </div>

                    {onResetFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                        >
                            <span>Clear all filters</span>
                            <span className="text-gray-400">×</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskFilters;
