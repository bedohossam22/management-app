import React, { useState, useEffect, useMemo } from 'react';
import { useFocus } from '../../context/FocusContext';
import api from '../../services/api';
import type { Task } from '../../types';
import type { AmbientSoundType } from '../../types/focus';
import { getPriorityBadgeClass } from '../../utils/helpers';

const FocusModal: React.FC = () => {
    const {
        isModalOpen,
        closeFocusModal,
        mode,
        timeLeft,
        progressPercent,
        isActive,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setMode,
        selectedTask,
        selectTask,
        settings,
        updateSettings,
        stats,
        currentRound,
        markTaskComplete,
    } = useFocus();

    const [activeTab, setActiveTab] = useState<'timer' | 'settings'>('timer');
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [taskSearch, setTaskSearch] = useState('');
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Format minutes and seconds (e.g., 25:00)
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // SVG Circular Progress calculation
    const radius = 135;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    // Fetch tasks when task picker opens
    useEffect(() => {
        if (isTaskPickerOpen) {
            setLoadingTasks(true);
            api.get('/tasks')
                .then((res) => {
                    const data = res.data.data || res.data;
                    if (Array.isArray(data)) {
                        setAvailableTasks(data.filter((t) => t.status !== 'Done'));
                    }
                })
                .catch(() => {})
                .finally(() => setLoadingTasks(false));
        }
    }, [isTaskPickerOpen]);

    // Filter available tasks by search
    const filteredTasks = useMemo(() => {
        if (!taskSearch.trim()) return availableTasks;
        const query = taskSearch.toLowerCase();
        return availableTasks.filter(
            (t) =>
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
        );
    }, [availableTasks, taskSearch]);

    // Keyboard controls inside modal (Space to Play/Pause, Esc to close)
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTag = (document.activeElement as HTMLElement)?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (isActive) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            } else if (e.key === 'Escape') {
                closeFocusModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isActive, startTimer, pauseTimer, closeFocusModal]);

    if (!isModalOpen) return null;

    const getModeStroke = () => {
        if (mode === 'pomodoro') return '#f97316'; // orange-500
        if (mode === 'shortBreak') return '#10b981'; // emerald-500
        return '#6366f1'; // indigo-500
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-stone-800 w-full max-w-xl overflow-hidden relative flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">
                            🍅
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-stone-100">
                                Pomodoro Focus
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-stone-400">
                                Deep work sessions & mindful breaks
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab((prev) => (prev === 'timer' ? 'settings' : 'timer'))}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                activeTab === 'settings'
                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-stone-300 hover:bg-gray-100 dark:hover:bg-stone-800'
                            }`}
                            title="Timer Settings"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={closeFocusModal}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-stone-300 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {activeTab === 'timer' ? (
                        <>
                            {/* Mode Switcher Tabs */}
                            <div className="flex bg-gray-100 dark:bg-stone-800/80 p-1 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setMode('pomodoro')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                        mode === 'pomodoro'
                                            ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 shadow-xs'
                                            : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
                                    }`}
                                >
                                    🍅 Focus ({settings.workDuration}m)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('shortBreak')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                        mode === 'shortBreak'
                                            ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                            : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
                                    }`}
                                >
                                    ☕ Short Break ({settings.shortBreakDuration}m)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('longBreak')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                        mode === 'longBreak'
                                            ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                            : 'text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
                                    }`}
                                >
                                    🌴 Long Break ({settings.longBreakDuration}m)
                                </button>
                            </div>

                            {/* Circular Countdown Display */}
                            <div className="relative flex items-center justify-center my-4">
                                <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 300 300">
                                    {/* Background track ring */}
                                    <circle
                                        cx="150"
                                        cy="150"
                                        r={radius}
                                        className="stroke-gray-100 dark:stroke-stone-800"
                                        strokeWidth="12"
                                        fill="transparent"
                                    />
                                    {/* Progress animated ring */}
                                    <circle
                                        cx="150"
                                        cy="150"
                                        r={radius}
                                        stroke={getModeStroke()}
                                        strokeWidth="12"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        className="transition-all duration-300"
                                    />
                                </svg>

                                {/* Center Content inside Ring */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-5xl font-black tracking-tight text-gray-900 dark:text-stone-100 font-mono">
                                        {formattedTime}
                                    </span>

                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span
                                            className={`inline-block w-2 h-2 rounded-full ${
                                                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                                            }`}
                                        />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-stone-400">
                                            {isActive ? 'Session Active' : 'Paused'}
                                        </span>
                                    </div>

                                    {/* Cycle Round Dots (e.g. 4 rounds before long break) */}
                                    <div className="flex items-center gap-1.5 mt-3">
                                        {Array.from({ length: settings.longBreakInterval }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                    idx < currentRound - 1
                                                        ? 'bg-orange-500 dark:bg-orange-400 scale-100'
                                                        : idx === currentRound - 1 && mode === 'pomodoro'
                                                        ? 'bg-orange-500 ring-2 ring-orange-300 dark:ring-orange-800 scale-110'
                                                        : 'bg-gray-200 dark:bg-stone-700'
                                                }`}
                                                title={`Round ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-stone-400 mt-1">
                                        Round {currentRound} of {settings.longBreakInterval}
                                    </span>
                                </div>
                            </div>

                            {/* Attached Focused Task Pill */}
                            <div className="bg-gray-50 dark:bg-stone-800/80 rounded-2xl p-3.5 border border-gray-200 dark:border-stone-700">
                                {selectedTask ? (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Target Task
                                                </span>
                                                <span
                                                    className={`text-[10px] font-semibold px-2 py-0.2 rounded ${getPriorityBadgeClass(
                                                        selectedTask.priority
                                                    )}`}
                                                >
                                                    {selectedTask.priority}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-stone-100 truncate">
                                                {selectedTask.title}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {selectedTask.status !== 'Done' && (
                                                <button
                                                    type="button"
                                                    onClick={markTaskComplete}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                                    title="Mark task as Done"
                                                >
                                                    Done ✓
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => setIsTaskPickerOpen(true)}
                                                className="p-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                                                title="Switch Task"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => selectTask(null)}
                                                className="p-1.5 text-xs text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                                title="Detach Task"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-stone-400">
                                            <span>🎯</span>
                                            <span>No task linked to this session</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsTaskPickerOpen(true)}
                                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-stone-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-stone-600 border border-gray-200 dark:border-stone-600 transition-colors cursor-pointer"
                                        >
                                            + Attach Task
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Task Picker Modal Dropdown (if opened) */}
                            {isTaskPickerOpen && (
                                <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-gray-200 dark:border-stone-700 shadow-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 dark:text-stone-300">
                                            Select Task to Focus On
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsTaskPickerOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xs"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={taskSearch}
                                        onChange={(e) => setTaskSearch(e.target.value)}
                                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-900 text-gray-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                    />

                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {loadingTasks ? (
                                            <p className="text-xs text-gray-400 text-center py-2">Loading tasks...</p>
                                        ) : filteredTasks.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2">No pending tasks found</p>
                                        ) : (
                                            filteredTasks.map((t) => (
                                                <button
                                                    key={t._id}
                                                    type="button"
                                                    onClick={() => {
                                                        selectTask(t);
                                                        setIsTaskPickerOpen(false);
                                                    }}
                                                    className="w-full text-left p-2 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-stone-700 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                                                >
                                                    <span className="truncate font-medium text-gray-800 dark:text-stone-200">
                                                        {t.title}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getPriorityBadgeClass(t.priority)}`}>
                                                        {t.priority}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Main Controls Row */}
                            <div className="flex items-center justify-center gap-4 pt-2">
                                {/* Reset button */}
                                <button
                                    type="button"
                                    onClick={resetTimer}
                                    className="p-3 rounded-2xl bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 text-gray-600 dark:text-stone-300 transition-all cursor-pointer"
                                    title="Reset timer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>

                                {/* Play / Pause Primary Button */}
                                <button
                                    type="button"
                                    onClick={isActive ? pauseTimer : startTimer}
                                    className={`py-4 px-8 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2.5 cursor-pointer text-base ${
                                        isActive
                                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                                            : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-orange-500/30'
                                    }`}
                                >
                                    {isActive ? (
                                        <>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                            </svg>
                                            <span>Pause</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                            <span>Start Focus</span>
                                        </>
                                    )}
                                </button>

                                {/* Skip button */}
                                <button
                                    type="button"
                                    onClick={skipTimer}
                                    className="p-3 rounded-2xl bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 text-gray-600 dark:text-stone-300 transition-all cursor-pointer"
                                    title="Skip to next phase"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Ambient Sound & Quick Audio Bar */}
                            <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-stone-400 pt-3 border-t border-gray-100 dark:border-stone-800 gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-700 dark:text-stone-300">Ambient sound:</span>
                                    {(['none', 'rain', 'cafe'] as AmbientSoundType[]).map((snd) => (
                                        <button
                                            key={snd}
                                            type="button"
                                            onClick={() => updateSettings({ ambientSound: snd })}
                                            className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                                settings.ambientSound === snd
                                                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                                    : 'hover:bg-gray-100 dark:hover:bg-stone-800 text-gray-600 dark:text-stone-400'
                                            }`}
                                        >
                                            {snd === 'none' && 'Mute'}
                                            {snd === 'rain' && '🌧️ Rain'}
                                            {snd === 'cafe' && '☕ Cafe'}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.tickingEnabled}
                                        onChange={(e) => updateSettings({ tickingEnabled: e.target.checked })}
                                        className="rounded text-orange-500 focus:ring-orange-400 cursor-pointer"
                                    />
                                    <span>Ticking clock</span>
                                </label>
                            </div>

                            {/* Daily Focus Summary Bar */}
                            <div className="bg-orange-50/60 dark:bg-orange-950/20 rounded-2xl p-3 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                    <span className="text-orange-500 text-base">🔥</span>
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-stone-200">
                                            {stats.completedPomodoros} of {stats.dailyTarget} sessions completed today
                                        </span>
                                        <p className="text-[11px] text-gray-500 dark:text-stone-400">
                                            {stats.totalFocusMinutes} minutes of deep focus logged
                                        </p>
                                    </div>
                                </div>
                                <div className="w-20 bg-orange-200 dark:bg-orange-900/40 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(100, Math.round((stats.completedPomodoros / stats.dailyTarget) * 100))}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Settings Tab */
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-stone-100 mb-2">
                                Timer Preferences
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-stone-300 mb-1">
                                        Focus (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={settings.workDuration}
                                        onChange={(e) => updateSettings({ workDuration: Number(e.target.value) || 25 })}
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 text-gray-900 dark:text-stone-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-stone-300 mb-1">
                                        Short Break (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={settings.shortBreakDuration}
                                        onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) || 5 })}
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 text-gray-900 dark:text-stone-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-stone-300 mb-1">
                                        Long Break (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={settings.longBreakDuration}
                                        onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) || 15 })}
                                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 text-gray-900 dark:text-stone-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-stone-300 mb-1">
                                    Sessions before Long Break
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={settings.longBreakInterval}
                                    onChange={(e) => updateSettings({ longBreakInterval: Number(e.target.value) || 4 })}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-800 text-gray-900 dark:text-stone-100"
                                />
                            </div>

                            <div className="pt-3 border-t border-gray-100 dark:border-stone-800 space-y-2">
                                <label className="flex items-center justify-between text-xs text-gray-700 dark:text-stone-300 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-stone-800 cursor-pointer">
                                    <span>Chimes and audio alerts</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.soundEnabled}
                                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                                        className="w-4 h-4 text-orange-600 rounded"
                                    />
                                </label>

                                <label className="flex items-center justify-between text-xs text-gray-700 dark:text-stone-300 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-stone-800 cursor-pointer">
                                    <span>Soft ticking sound during focus</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.tickingEnabled}
                                        onChange={(e) => updateSettings({ tickingEnabled: e.target.checked })}
                                        className="w-4 h-4 text-orange-600 rounded"
                                    />
                                </label>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('timer')}
                                    className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FocusModal;
