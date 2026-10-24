import React, { useState } from 'react';
import type { Comment, Note } from '../../types';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

interface TaskCommentsProps {
    taskId: string;
    comments?: Comment[];
    notes?: Note[]; // for backward compatibility with existing notes
    onCommentsUpdate: (comments: Comment[]) => void;
    compact?: boolean;
    autoFocus?: boolean;
}

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-500 text-white',
        'bg-indigo-500 text-white',
        'bg-emerald-500 text-white',
        'bg-amber-500 text-white',
        'bg-purple-500 text-white',
        'bg-rose-500 text-white',
        'bg-teal-500 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatCommentDate = (dateString?: string): string => {
    if (!dateString) return 'Just now';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 30) return 'Just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    } catch {
        return '';
    }
};

const formatTooltipDate = (dateString?: string): string => {
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

const QUICK_CHIPS = ['👍 Looks good', '👀 In review', '⏳ Need more time', '🚀 Done!'];

const TaskComments: React.FC<TaskCommentsProps> = ({
    taskId,
    comments = [],
    notes = [],
    onCommentsUpdate,
    compact = false,
    autoFocus = false,
}) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Normalize comments: if comments array is empty, fallback to notes
    const activeComments: Comment[] =
        comments && comments.length > 0
            ? comments
            : (notes || []).map((n) => ({
                  _id: n._id,
                  text: n.content,
                  userName: 'Note',
                  createdAt: n.createdAt,
              }));

    const handleAddComment = async (overrideText?: string) => {
        const contentToSend = (overrideText ?? newComment).trim();
        if (!contentToSend || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post(`/tasks/${taskId}/comments`, {
                text: contentToSend,
            });
            const updatedTask = response.data.data || response.data;
            if (updatedTask?.comments) {
                onCommentsUpdate(updatedTask.comments);
            } else {
                // Optimistic addition if backend responded differently
                const mockComment: Comment = {
                    _id: Date.now().toString(),
                    text: contentToSend,
                    userName: user?.name || 'You',
                    user: user?.id,
                    createdAt: new Date().toISOString(),
                };
                onCommentsUpdate([...activeComments, mockComment]);
            }
            setNewComment('');
            toast.success('Comment posted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (deletingId) return;
        setDeletingId(commentId);
        try {
            const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
            const updatedTask = response.data.data || response.data;
            if (updatedTask?.comments) {
                onCommentsUpdate(updatedTask.comments);
            } else {
                onCommentsUpdate(activeComments.filter((c) => c._id !== commentId));
            }
            toast.success('Comment deleted');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        } finally {
            setDeletingId(null);
        }
    };

    const isOverLimit = newComment.length > 1000;

    return (
        <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
            {/* Header info bar */}
            <div className="flex items-center justify-between text-gray-500 font-medium">
                <div className="flex items-center gap-1.5 text-gray-700">
                    <svg
                        className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-blue-600`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <span className="font-semibold text-gray-800">
                        {compact ? 'Comments' : 'Discussion & Comments'}
                    </span>
                    <span className="ml-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {activeComments.length}
                    </span>
                </div>
                <span className="text-[11px] text-gray-400">
                    {compact ? 'Ctrl+Enter to post' : 'Press Ctrl+Enter to post'}
                </span>
            </div>

            {/* Quick reaction chips in compact mode */}
            {compact && activeComments.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {QUICK_CHIPS.map((chip) => (
                        <button
                            key={chip}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setNewComment(chip);
                            }}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 rounded-md text-[11px] transition-colors cursor-pointer border border-gray-200/60"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            )}

            {/* Comments Thread */}
            {activeComments.length > 0 ? (
                <div
                    className={`space-y-2 overflow-y-auto pr-1 ${
                        compact ? 'max-h-44' : 'max-h-64'
                    }`}
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {activeComments.map((comment) => {
                        const authorName = comment.userName || 'Anonymous';
                        const isAuthor =
                            user &&
                            (comment.user === user.id ||
                                authorName.toLowerCase() === user.name.toLowerCase());

                        return (
                            <div
                                key={comment._id}
                                className={`group/comment relative p-2.5 rounded-xl border transition-all duration-150 ${
                                    deletingId === comment._id ? 'opacity-40 scale-[0.98]' : ''
                                } ${
                                    isAuthor
                                        ? 'bg-blue-50/40 border-blue-100'
                                        : 'bg-gray-50/80 border-gray-200/80 hover:bg-gray-100/70'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`shrink-0 flex items-center justify-center font-bold rounded-full ${
                                                compact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'
                                            } ${getAvatarColor(authorName)}`}
                                        >
                                            {getInitials(authorName)}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-gray-900 text-xs">
                                                {authorName}
                                            </span>
                                            {isAuthor && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                                                    You
                                                </span>
                                            )}
                                            <span
                                                className="text-[11px] text-gray-400 font-medium cursor-help"
                                                title={formatTooltipDate(comment.createdAt)}
                                            >
                                                • {formatCommentDate(comment.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(comment._id);
                                        }}
                                        disabled={deletingId === comment._id}
                                        className="opacity-0 group-hover/comment:opacity-100 text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-all cursor-pointer"
                                        title="Delete comment"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <p className="mt-1.5 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words pl-7">
                                    {comment.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400">
                        No comments yet. Leave a quick update or question below.
                    </p>
                </div>
            )}

            {/* Input Form */}
            <div className="relative pt-1">
                <div className="relative flex items-end gap-1.5">
                    <textarea
                        value={newComment}
                        autoFocus={autoFocus}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                        placeholder="Write a comment... (Ctrl+Enter to post)"
                        rows={compact ? 2 : 2}
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 text-xs transition-all shadow-2xs resize-none bg-white ${
                            isOverLimit
                                ? 'border-rose-300 focus:ring-rose-400'
                                : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddComment();
                        }}
                        disabled={!newComment.trim() || isSubmitting || isOverLimit}
                        className="shrink-0 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center justify-center"
                        title="Post comment"
                    >
                        {isSubmitting ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>
                {isOverLimit && (
                    <span className="text-[10px] text-rose-500 font-medium block mt-1">
                        Exceeds 1000 character limit ({newComment.length}/1000)
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskComments;
