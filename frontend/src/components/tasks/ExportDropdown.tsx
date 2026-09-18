import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types';
import { exportTasksToCSV, exportTasksToJSON } from '../../utils/exportTasks';
import { toast } from 'react-toastify';

interface ExportDropdownProps {
    filteredTasks: Task[];
    allTasks: Task[];
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ filteredTasks, allTasks }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const hasTasks = allTasks.length > 0;
    const isFiltered = filteredTasks.length !== allTasks.length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExport = (format: 'csv' | 'json', target: 'filtered' | 'all') => {
        const tasksToExport = target === 'filtered' ? filteredTasks : allTasks;
        if (tasksToExport.length === 0) {
            toast.info('No tasks to export');
            setIsOpen(false);
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const prefix = target === 'filtered' && isFiltered ? 'tasks_filtered' : 'tasks_all';
        const filename = `${prefix}_${dateStr}.${format}`;

        let success = false;
        if (format === 'csv') {
            success = exportTasksToCSV(tasksToExport, filename);
        } else {
            success = exportTasksToJSON(tasksToExport, filename);
        }

        if (success) {
            toast.success(`Exported ${tasksToExport.length} task${tasksToExport.length === 1 ? '' : 's'} as ${format.toUpperCase()}!`);
        } else {
            toast.error('Failed to export tasks');
        }

        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={!hasTasks}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg border transition-all flex items-center space-x-2 ${
                    hasTasks
                        ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm cursor-pointer'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
                title={!hasTasks ? 'No tasks available to export' : 'Export tasks'}
            >
                <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                <span>Export</span>
                <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2">
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            CSV Format (Excel)
                        </div>
                        {isFiltered && (
                            <button
                                onClick={() => handleExport('csv', 'filtered')}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-between group transition-colors"
                            >
                                <span>Filtered Tasks</span>
                                <span className="text-xs bg-gray-100 group-hover:bg-blue-100 px-2 py-0.5 rounded-full text-gray-600 group-hover:text-blue-700 font-mono">
                                    {filteredTasks.length}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => handleExport('csv', 'all')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-between group transition-colors"
                        >
                            <span>{isFiltered ? 'All Tasks' : 'All Tasks (CSV)'}</span>
                            <span className="text-xs bg-gray-100 group-hover:bg-blue-100 px-2 py-0.5 rounded-full text-gray-600 group-hover:text-blue-700 font-mono">
                                {allTasks.length}
                            </span>
                        </button>
                    </div>

                    <div className="p-2">
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            JSON Format
                        </div>
                        {isFiltered && (
                            <button
                                onClick={() => handleExport('json', 'filtered')}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-between group transition-colors"
                            >
                                <span>Filtered Tasks</span>
                                <span className="text-xs bg-gray-100 group-hover:bg-blue-100 px-2 py-0.5 rounded-full text-gray-600 group-hover:text-blue-700 font-mono">
                                    {filteredTasks.length}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => handleExport('json', 'all')}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center justify-between group transition-colors"
                        >
                            <span>{isFiltered ? 'All Tasks' : 'All Tasks (JSON)'}</span>
                            <span className="text-xs bg-gray-100 group-hover:bg-blue-100 px-2 py-0.5 rounded-full text-gray-600 group-hover:text-blue-700 font-mono">
                                {allTasks.length}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
