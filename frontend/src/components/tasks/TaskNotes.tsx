import React, { useState } from 'react';
import type { Note } from '../../types';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface TaskNotesProps {
    taskId: string;
    notes: Note[];
    onNotesUpdate: (notes: Note[]) => void;
}

const formatNoteDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    } catch {
        return dateString;
    }
};

const formatNoteTooltipDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

const TaskNotes: React.FC<TaskNotesProps> = ({ taskId, notes, onNotesUpdate }) => {
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleAddNote = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newNote.trim();
        if (!trimmed || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post(`/tasks/${taskId}/notes`, { content: trimmed });
            const updatedTask = response.data.data || response.data;
            if (updatedTask?.notes) {
                onNotesUpdate(updatedTask.notes);
            }
            setNewNote('');
            toast.success('Note added');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (deletingId) return;
        setDeletingId(noteId);
        try {
            const response = await api.delete(`/tasks/${taskId}/notes/${noteId}`);
            const updatedTask = response.data.data || response.data;
            if (updatedTask?.notes) {
                onNotesUpdate(updatedTask.notes);
            } else {
                onNotesUpdate(notes.filter((n) => n._id !== noteId));
            }
            toast.success('Note deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete note');
        } finally {
            setDeletingId(null);
        }
    };

    const charCount = newNote.length;
    const isOverLimit = charCount > 1000;

    return (
        <div className="pt-3 border-t border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Activity Log</span>
                    <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {notes.length > 0 && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </span>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-3">
                    {/* Add Note Input */}
                    <div className="relative">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                            }}
                            placeholder="Add a note or update... (Ctrl+Enter to save)"
                            rows={2}
                            className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm transition-all shadow-xs resize-none ${
                                isOverLimit
                                    ? 'border-rose-300 focus:ring-rose-400 focus:border-transparent'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            <span className={`text-[11px] ${isOverLimit ? 'text-rose-500 font-medium' : 'text-gray-400'}`}>
                                {charCount > 0 ? `${charCount}/1000` : ''}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleAddNote()}
                                disabled={!newNote.trim() || isSubmitting || isOverLimit}
                                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-200/60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Add Note</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notes List */}
                    {notes.length > 0 && (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {[...notes].reverse().map((note) => (
                                <div
                                    key={note._id}
                                    className={`group/note relative bg-gray-50/80 border border-gray-200/80 rounded-xl p-3 transition-all duration-200 hover:bg-gray-100/70 ${
                                        deletingId === note._id ? 'opacity-50 scale-[0.98]' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words flex-1">
                                            {note.content}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteNote(note._id)}
                                            disabled={deletingId === note._id}
                                            className="opacity-0 group-hover/note:opacity-100 shrink-0 p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-150 cursor-pointer"
                                            title="Delete note"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span
                                            className="text-[11px] text-gray-400 font-medium"
                                            title={formatNoteTooltipDate(note.createdAt)}
                                        >
                                            {formatNoteDate(note.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {notes.length === 0 && !newNote && (
                        <div className="text-center py-3">
                            <svg className="w-8 h-8 mx-auto text-gray-300 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <p className="text-xs text-gray-400">No notes yet. Add updates or progress notes above.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskNotes;
