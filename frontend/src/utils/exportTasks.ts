import type { Task } from '../types';

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

    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Subtasks Progress', 'Subtasks List', 'Created At', 'Updated At'];
    
    const rows = tasks.map((task) => {
        const subtasks = task.subtasks || [];
        const completed = subtasks.filter((s) => s.isCompleted).length;
        const subtaskProgress = subtasks.length > 0 ? `${completed}/${subtasks.length} (${Math.round((completed / subtasks.length) * 100)}%)` : 'None';
        const subtaskList = subtasks.map((s) => `[${s.isCompleted ? 'x' : ' '}] ${s.title}`).join('; ');

        return [
            escapeCSVField(task.title),
            escapeCSVField(task.description || ''),
            escapeCSVField(task.status),
            escapeCSVField(task.priority),
            escapeCSVField(task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''),
            escapeCSVField(subtaskProgress),
            escapeCSVField(subtaskList),
            escapeCSVField(task.createdAt ? new Date(task.createdAt).toLocaleString() : ''),
            escapeCSVField(task.updatedAt ? new Date(task.updatedAt).toLocaleString() : ''),
        ];
    });

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

/**
 * Export a list of tasks as a formatted Markdown checklist
 */
export const exportTasksToMarkdown = (tasks: Task[], customFilename?: string): boolean => {
    if (!tasks || tasks.length === 0) {
        return false;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const doneCount = tasks.filter((t) => t.status === 'Done').length;
    const progressPercent = Math.round((doneCount / tasks.length) * 100);

    let md = `# Task Export (${dateStr})\n\n`;
    md += `**Summary:** ${doneCount} of ${tasks.length} tasks completed (${progressPercent}%)\n\n`;
    md += `| Status | Priority | Title | Due Date | Checklist | Description |\n`;
    md += `|---|---|---|---|---|---|\n`;

    tasks.forEach((task) => {
        const check = task.status === 'Done' ? '[x]' : '[ ]';
        const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-';
        const desc = (task.description || '').replace(/\r?\n/g, ' ');
        const subtasks = task.subtasks || [];
        const completedSubs = subtasks.filter((s) => s.isCompleted).length;
        const subtaskSummary = subtasks.length > 0 ? `${completedSubs}/${subtasks.length}` : '-';

        md += `| ${check} ${task.status} | ${task.priority} | **${task.title}** | ${due} | ${subtaskSummary} | ${desc} |\n`;
    });

    // Detailed checklist breakout
    const tasksWithSubtasks = tasks.filter((t) => t.subtasks && t.subtasks.length > 0);
    if (tasksWithSubtasks.length > 0) {
        md += `\n## Subtasks Breakout\n\n`;
        tasksWithSubtasks.forEach((t) => {
            md += `### ${t.title} (${t.status})\n`;
            t.subtasks?.forEach((st) => {
                md += `- [${st.isCompleted ? 'x' : ' '}] ${st.title}\n`;
            });
            md += `\n`;
        });
    }

    const filename = customFilename || `tasks_export_${dateStr}.md`;
    downloadFile(md, filename, 'text/markdown;charset=utf-8;');
    return true;
};

/**
 * Open a beautifully styled print summary view for PDF export or immediate printing
 */
export const printTasksSummary = (tasks: Task[], title: string = 'Tasks Summary Report'): boolean => {
    if (!tasks || tasks.length === 0) {
        return false;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        return false;
    }

    const total = tasks.length;
    const doneCount = tasks.filter((t) => t.status === 'Done').length;
    const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
    const todoCount = tasks.filter((t) => t.status === 'To Do').length;
    const highPriorityCount = tasks.filter((t) => t.priority === 'High').length;
    const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: 'full' });

    const priorityBadge = (p: string) => {
        if (p === 'High') return 'background:#fee2e2;color:#991b1b;border:1px solid #fecaca;';
        if (p === 'Medium') return 'background:#fef3c7;color:#92400e;border:1px solid #fde68a;';
        return 'background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;';
    };

    const statusBadge = (s: string) => {
        if (s === 'Done') return 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0;';
        if (s === 'In Progress') return 'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;';
        return 'background:#f3f4f6;color:#4b5563;border:1px solid #e5e7eb;';
    };

    const rowsHtml = tasks
        .map(
            (t, index) => {
                const subtasks = t.subtasks || [];
                const doneSubs = subtasks.filter((s) => s.isCompleted).length;
                const subtaskHtml = subtasks.length > 0 
                    ? `<div style="margin-top:4px; font-size:11px; color:#4b5563; background:#f3f4f6; padding:2px 6px; border-radius:4px; display:inline-block;">Checklist: ${doneSubs}/${subtasks.length} done</div>`
                    : '';

                return `
        <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 1 ? 'background-color: #f9fafb;' : ''}">
            <td style="padding: 10px 12px; font-weight: 600; color: #111827;">
                ${t.title}
                ${subtaskHtml}
            </td>
            <td style="padding: 10px 12px; color: #4b5563; font-size: 13px;">${t.description || '<span style="color:#9ca3af">—</span>'}</td>
            <td style="padding: 10px 12px; text-align: center;">
                <span style="display:inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 9999px; ${statusBadge(t.status)}">${t.status}</span>
            </td>
            <td style="padding: 10px 12px; text-align: center;">
                <span style="display:inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 9999px; ${priorityBadge(t.priority)}">${t.priority}</span>
            </td>
            <td style="padding: 10px 12px; color: #4b5563; font-size: 13px; text-align: right;">
                ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
            </td>
        </tr>`;
            }
        )
        .join('');

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 32px;
            color: #1f2937;
            background: #fff;
        }
        @media print {
            body { margin: 16px; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 8px;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        <button onclick="window.close()" style="background: #e5e7eb; color: #374151; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Close</button>
    </div>

    <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827;">${title}</h1>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">Generated on ${dateStr} &bull; Total: ${total} task${total === 1 ? '' : 's'}</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #111827;">${total}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; margin-top: 2px;">Total Tasks</div>
        </div>
        <div style="background: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #86198f;">${todoCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #86198f; margin-top: 2px;">To Do</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${inProgressCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #1e40af; margin-top: 2px;">In Progress</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #166534;">${doneCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #166534; margin-top: 2px;">Completed</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #991b1b;">${highPriorityCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #991b1b; margin-top: 2px;">High Priority</div>
        </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
            <tr style="background: #f3f4f6; border-bottom: 2px solid #d1d5db;">
                <th style="padding: 10px 12px; font-weight: 600; color: #374151;">Task</th>
                <th style="padding: 10px 12px; font-weight: 600; color: #374151;">Description</th>
                <th style="padding: 10px 12px; font-weight: 600; color: #374151; text-align: center;">Status</th>
                <th style="padding: 10px 12px; font-weight: 600; color: #374151; text-align: center;">Priority</th>
                <th style="padding: 10px 12px; font-weight: 600; color: #374151; text-align: right;">Due Date</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHtml}
        </tbody>
    </table>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    return true;
};
