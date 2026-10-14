import React from 'react';
import { useFocus } from '../../context/FocusContext';

const FocusWidget: React.FC = () => {
    const {
        mode,
        timeLeft,
        isActive,
        startTimer,
        pauseTimer,
        selectedTask,
        openFocusModal,
        isModalOpen,
        isWidgetMinimized,
        toggleWidgetMinimized,
        progressPercent,
    } = useFocus();

    // Do not show widget if full modal is open
    if (isModalOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const getModeIcon = () => {
        if (mode === 'pomodoro') return '🍅';
        if (mode === 'shortBreak') return '☕';
        return '🌴';
    };

    const getModeLabel = () => {
        if (mode === 'pomodoro') return 'Focus';
        if (mode === 'shortBreak') return 'Short Break';
        return 'Long Break';
    };

    // Compact circular pill if minimized
    if (isWidgetMinimized) {
        return (
            <button
                type="button"
                onClick={toggleWidgetMinimized}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-full shadow-xl border border-gray-200 dark:border-stone-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
                title="Expand Focus Timer"
            >
                <div className="relative">
                    <span className="text-base">{getModeIcon()}</span>
                    {isActive && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                    )}
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-stone-200 font-mono">
                    {formattedTime}
                </span>
                <span className="text-gray-400 group-hover:text-gray-600 text-[10px]">▲</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-stone-700 p-3 min-w-[240px] max-w-xs transition-all animate-slide-up group">
            {/* Top Row: Mode & Minimize / Open buttons */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div
                    onClick={() => openFocusModal()}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to open full Focus Mode"
                >
                    <span className="text-base">{getModeIcon()}</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-stone-200">
                        {getModeLabel()}
                    </span>
                    {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={toggleWidgetMinimized}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-stone-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Minimize"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => openFocusModal()}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Expand to Full View"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Task Preview (if attached) */}
            {selectedTask && (
                <div
                    onClick={() => openFocusModal()}
                    className="mb-2.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-stone-800/80 border border-gray-100 dark:border-stone-750 text-left cursor-pointer hover:border-gray-300 transition-colors"
                >
                    <p className="text-[11px] font-semibold text-gray-700 dark:text-stone-300 truncate">
                        🎯 {selectedTask.title}
                    </p>
                </div>
            )}

            {/* Middle Row: Big Timer + Play/Pause */}
            <div className="flex items-center justify-between gap-3">
                <div
                    onClick={() => openFocusModal()}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <span className="text-2xl font-black text-gray-900 dark:text-stone-100 font-mono tracking-tight">
                        {formattedTime}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={isActive ? pauseTimer : startTimer}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-xs'
                            : 'bg-orange-500 hover:bg-orange-600 shadow-xs'
                    }`}
                >
                    {isActive ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>Focus</span>
                        </>
                    )}
                </button>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-stone-800 rounded-full h-1 mt-2.5 overflow-hidden">
                <div
                    className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

export default FocusWidget;
