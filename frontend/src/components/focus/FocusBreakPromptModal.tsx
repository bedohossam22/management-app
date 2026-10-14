import React from 'react';
import { useFocus } from '../../context/FocusContext';

const FocusBreakPromptModal: React.FC = () => {
    const {
        breakPromptOpen,
        completedSessionData,
        closeBreakPrompt,
        claimCoffeeReward,
        setMode,
        startTimer,
        selectedTask,
        markTaskComplete,
    } = useFocus();

    if (!breakPromptOpen || !completedSessionData) return null;

    const handleStartBreak = () => {
        closeBreakPrompt();
        setMode('shortBreak');
        setTimeout(() => {
            startTimer();
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-amber-200/50 dark:border-amber-900/30 w-full max-w-md overflow-hidden relative p-6 sm:p-8 text-center">
                {/* Background decorative glow */}
                <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-rose-400/20 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={closeBreakPrompt}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-stone-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Dismiss"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Animated Coffee Cup & Steam Icon */}
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5 relative group">
                    <span className="text-4xl animate-bounce">☕</span>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                    </span>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wide uppercase mb-2">
                    Session Complete!
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-stone-100 tracking-tight mb-2">
                    Time for a Coffee Break!
                </h3>

                <p className="text-sm text-gray-600 dark:text-stone-300 mb-4 leading-relaxed">
                    Outstanding focus! You just crushed a{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {completedSessionData.durationMinutes}-minute
                    </span>{' '}
                    deep work session.
                </p>

                {completedSessionData.taskTitle && (
                    <div className="bg-gray-50 dark:bg-stone-800/80 rounded-xl p-3 mb-6 border border-gray-200 dark:border-stone-700 text-left flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-medium text-gray-400 dark:text-stone-400 uppercase tracking-wider block mb-0.5">
                                Focused on task:
                            </span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-stone-200 truncate">
                                {completedSessionData.taskTitle}
                            </p>
                        </div>
                        {selectedTask && selectedTask.status !== 'Done' && (
                            <button
                                onClick={markTaskComplete}
                                className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                title="Mark this task as completed"
                            >
                                Mark Done ✓
                            </button>
                        )}
                    </div>
                )}

                {/* Primary Actions */}
                <div className="space-y-2.5">
                    <button
                        onClick={claimCoffeeReward}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-600/25 hover:shadow-lg hover:shadow-amber-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
                    >
                        <span>☕</span>
                        <span>Brew at the Coffee Bar</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleStartBreak}
                            className="py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-gray-700 dark:text-stone-200 bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>5m Quick Break</span>
                        </button>

                        <button
                            onClick={closeBreakPrompt}
                            className="py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-gray-500 dark:text-stone-400 hover:text-gray-700 dark:hover:text-stone-200 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                            Keep Working
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusBreakPromptModal;
