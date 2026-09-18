import { Task } from '../types';

/**
 * Escapes fields for CSV format
 */
const escapeCSVField = (field: string | number | undefined | null): string => {
    if (field === undefined || field === null) return '""';
    const stringField = String(field);
    // Escape double quotes by doubling them
    return `"${stringField.replace(/"/g, '""')}"`;
};

/**
 * Triggers a browser download for a Blob
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Export a list of tasks as a CSV file
 */
export const exportTasksToCSV = (tasks: Task[], customFilename?: string): boolean => {
    if (!tasks || tasks.length === 0) {
        return false;
    }

    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At', 'Updated At'];
    
    const rows = tasks.map((task) => [
        escapeCSVField(task.title),
        escapeCSVField(task.description || ''),
        escapeCSVField(task.status),
        escapeCSVField(task.priority),
        escapeCSVField(task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''),
        escapeCSVField(task.createdAt ? new Date(task.createdAt).toLocaleString() : ''),
        escapeCSVField(task.updatedAt ? new Date(task.updatedAt).toLocaleString() : ''),
    ]);

    // Prepend UTF-8 BOM so Excel opens non-ASCII characters properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = customFilename || `tasks_export_${dateStr}.csv`;

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    return true;
};

/**
 * Export a list of tasks as a JSON file
 */
export const exportTasksToJSON = (tasks: Task[], customFilename?: string): boolean => {
    if (!tasks || tasks.length === 0) {
        return false;
    }

    const jsonContent = JSON.stringify(tasks, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = customFilename || `tasks_export_${dateStr}.json`;

    downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
    return true;
};
