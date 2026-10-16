import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { FocusMode, FocusSettings, FocusStats, FocusSession } from '../types/focus';
import type { Task } from '../types';
import { focusSound } from '../utils/focusSounds';
import { useCoffee } from './CoffeeContext';
import api from '../services/api';

interface FocusContextType {
    mode: FocusMode;
    timeLeft: number;
    totalDuration: number;
    progressPercent: number;
    isActive: boolean;
    selectedTask: Task | null;
    settings: FocusSettings;
    stats: FocusStats;
    currentRound: number;
    isModalOpen: boolean;
    isWidgetMinimized: boolean;
    breakPromptOpen: boolean;
    completedSessionData: {
        mode: FocusMode;
        taskTitle?: string;
        durationMinutes: number;
    } | null;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    skipTimer: () => void;
    setMode: (mode: FocusMode) => void;
    selectTask: (task: Task | null) => void;
    openFocusModal: (taskToFocus?: Task) => void;
    closeFocusModal: () => void;
    toggleWidgetMinimized: () => void;
    updateSettings: (newSettings: Partial<FocusSettings>) => void;
    closeBreakPrompt: () => void;
    claimCoffeeReward: () => void;
    markTaskComplete: () => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const SETTINGS_KEY = 'task_manager_focus_settings';
const STATS_KEY = 'task_manager_focus_stats';

const DEFAULT_SETTINGS: FocusSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    tickingEnabled: false,
    ambientSound: 'none',
};

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { openCoffeeBar } = useCoffee();

    // 1. Settings state
    const [settings, setSettings] = useState<FocusSettings>(() => {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    // 2. Stats state
    const [stats, setStats] = useState<FocusStats>(() => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const saved = localStorage.getItem(STATS_KEY);
            if (saved) {
                const parsed: FocusStats = JSON.parse(saved);
                if (parsed.todayDate === today) {
                    return parsed;
                }
                return {
                    todayDate: today,
                    completedPomodoros: 0,
                    totalFocusMinutes: 0,
                    dailyTarget: parsed.dailyTarget || 8,
                    totalAllTimePomodoros: parsed.totalAllTimePomodoros || 0,
                    totalAllTimeMinutes: parsed.totalAllTimeMinutes || 0,
                    recentSessions: parsed.recentSessions || [],
                };
            }
        } catch {}
        return {
            todayDate: today,
            completedPomodoros: 0,
            totalFocusMinutes: 0,
            dailyTarget: 8,
            totalAllTimePomodoros: 0,
            totalAllTimeMinutes: 0,
            recentSessions: [],
        };
    });

    // Save settings and stats
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {}
    }, [settings]);

    useEffect(() => {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        } catch {}
    }, [stats]);

    // Timer core states
    const [mode, setModeState] = useState<FocusMode>('pomodoro');
    const [isActive, setIsActive] = useState<boolean>(false);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Modal & UI states
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isWidgetMinimized, setIsWidgetMinimized] = useState<boolean>(false);
    const [breakPromptOpen, setBreakPromptOpen] = useState<boolean>(false);
    const [completedSessionData, setCompletedSessionData] = useState<{
        mode: FocusMode;
        taskTitle?: string;
        durationMinutes: number;
    } | null>(null);

    // Time calculations
    const getDurationForMode = useCallback(
        (targetMode: FocusMode) => {
            if (targetMode === 'pomodoro') return settings.workDuration * 60;
            if (targetMode === 'shortBreak') return settings.shortBreakDuration * 60;
            return settings.longBreakDuration * 60;
        },
        [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration]
    );

    const [timeLeft, setTimeLeft] = useState<number>(() => settings.workDuration * 60);

    const totalDuration = getDurationForMode(mode);
    const progressPercent = totalDuration > 0 ? Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100)) : 0;

    // Accuracy refs
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const endTimeRef = useRef<number | null>(null);
    const tickingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Stop all intervals
    const clearTimers = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (tickingIntervalRef.current) {
            clearInterval(tickingIntervalRef.current);
            tickingIntervalRef.current = null;
        }
        focusSound.stopAmbient();
    }, []);

    // Change mode
    const setMode = useCallback(
        (newMode: FocusMode) => {
            clearTimers();
            setIsActive(false);
            setModeState(newMode);
            const duration = getDurationForMode(newMode);
            setTimeLeft(duration);
            endTimeRef.current = null;
        },
        [clearTimers, getDurationForMode]
    );

    // Update settings helper
    const updateSettings = useCallback(
        (newSettings: Partial<FocusSettings>) => {
            setSettings((prev) => {
                const next = { ...prev, ...newSettings };
                if (newSettings.soundEnabled !== undefined) {
                    focusSound.setSoundEnabled(newSettings.soundEnabled);
                }
                return next;
            });
            // If timer isn't running and current mode duration changed, reset timeLeft
            if (!isActive) {
                if (newSettings.workDuration && mode === 'pomodoro') {
                    setTimeLeft(newSettings.workDuration * 60);
                } else if (newSettings.shortBreakDuration && mode === 'shortBreak') {
                    setTimeLeft(newSettings.shortBreakDuration * 60);
                } else if (newSettings.longBreakDuration && mode === 'longBreak') {
                    setTimeLeft(newSettings.longBreakDuration * 60);
                }
            }
        },
        [isActive, mode]
    );

    // Handle timer completion
    const handleTimerComplete = useCallback(() => {
        clearTimers();
        setIsActive(false);

        const finishedMode = mode;
        const durationMinutes = Math.round(getDurationForMode(finishedMode) / 60);
        const taskName = selectedTask ? selectedTask.title : undefined;

        if (finishedMode === 'pomodoro') {
            focusSound.playComplete();

            // Record session and update stats
            const newSession: FocusSession = {
                id: Date.now().toString(),
                taskId: selectedTask?._id,
                taskTitle: taskName,
                durationMinutes,
                mode: 'pomodoro',
                completedAt: new Date().toISOString(),
            };

            setStats((prev) => {
                const updatedCompleted = prev.completedPomodoros + 1;
                const updatedFocusMins = prev.totalFocusMinutes + durationMinutes;
                return {
                    ...prev,
                    completedPomodoros: updatedCompleted,
                    totalFocusMinutes: updatedFocusMins,
                    totalAllTimePomodoros: prev.totalAllTimePomodoros + 1,
                    totalAllTimeMinutes: prev.totalAllTimeMinutes + durationMinutes,
                    recentSessions: [newSession, ...prev.recentSessions].slice(0, 30),
                };
            });

            // Trigger celebratory break prompt
            setCompletedSessionData({
                mode: 'pomodoro',
                taskTitle: taskName,
                durationMinutes,
            });
            setBreakPromptOpen(true);

            // Determine next break mode
            const nextRound = currentRound >= settings.longBreakInterval ? 1 : currentRound + 1;
            setCurrentRound(nextRound);

            const nextMode: FocusMode = currentRound >= settings.longBreakInterval ? 'longBreak' : 'shortBreak';
            setModeState(nextMode);
            setTimeLeft(getDurationForMode(nextMode));
        } else {
            // Break completed
            focusSound.playBreakComplete();
            toast.info('Break time finished! Ready to dive back in? 🎯', { autoClose: 5000 });

            setModeState('pomodoro');
            setTimeLeft(getDurationForMode('pomodoro'));
        }
    }, [clearTimers, mode, getDurationForMode, selectedTask, currentRound, settings.longBreakInterval]);

    // Start timer
    const startTimer = useCallback(() => {
        if (isActive) return;
        focusSound.playStart();
        setIsActive(true);

        // Resume ambient sound if selected
        if (settings.ambientSound && settings.ambientSound !== 'none') {
            focusSound.setAmbientSound(settings.ambientSound);
        }

        const targetEnd = Date.now() + timeLeft * 1000;
        endTimeRef.current = targetEnd;

        // Ticking effect if enabled
        if (settings.tickingEnabled && mode === 'pomodoro') {
            tickingIntervalRef.current = setInterval(() => {
                focusSound.playTick();
            }, 1000);
        }

        // Main countdown interval (accurate against system clock)
        timerIntervalRef.current = setInterval(() => {
            if (!endTimeRef.current) return;
            const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                handleTimerComplete();
            }
        }, 300);
    }, [isActive, timeLeft, settings.ambientSound, settings.tickingEnabled, mode, handleTimerComplete]);

    // Pause timer
    const pauseTimer = useCallback(() => {
        if (!isActive) return;
        focusSound.playPause();
        clearTimers();
        setIsActive(false);

        if (endTimeRef.current) {
            const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);
            endTimeRef.current = null;
        }
    }, [isActive, clearTimers]);

    // Reset timer
    const resetTimer = useCallback(() => {
        clearTimers();
        setIsActive(false);
        setTimeLeft(getDurationForMode(mode));
        endTimeRef.current = null;
    }, [clearTimers, getDurationForMode, mode]);

    // Skip timer to next phase
    const skipTimer = useCallback(() => {
        clearTimers();
        setIsActive(false);
        if (mode === 'pomodoro') {
            const nextMode: FocusMode = currentRound >= settings.longBreakInterval ? 'longBreak' : 'shortBreak';
            setModeState(nextMode);
            setTimeLeft(getDurationForMode(nextMode));
        } else {
            setModeState('pomodoro');
            setTimeLeft(getDurationForMode('pomodoro'));
        }
    }, [clearTimers, mode, currentRound, settings.longBreakInterval, getDurationForMode]);

    // Select task
    const selectTask = useCallback((task: Task | null) => {
        setSelectedTask(task);
    }, []);

    // Open/Close modal
    const openFocusModal = useCallback((taskToFocus?: Task) => {
        if (taskToFocus) {
            setSelectedTask(taskToFocus);
        }
        setIsModalOpen(true);
    }, []);

    const closeFocusModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const toggleWidgetMinimized = useCallback(() => {
        setIsWidgetMinimized((prev) => !prev);
    }, []);

    const closeBreakPrompt = useCallback(() => {
        setBreakPromptOpen(false);
        setCompletedSessionData(null);
    }, []);

    const claimCoffeeReward = useCallback(() => {
        setBreakPromptOpen(false);
        setCompletedSessionData(null);
        setIsModalOpen(false);
        // Open the Coffee Bar modal!
        openCoffeeBar();
    }, [openCoffeeBar]);

    // Mark current task complete
    const markTaskComplete = useCallback(async () => {
        if (!selectedTask) return;
        try {
            await api.put(`/tasks/${selectedTask._id}`, { status: 'Done' });
            setSelectedTask((prev) => (prev ? { ...prev, status: 'Done' } : null));
            toast.success(`Task "${selectedTask.title}" marked as Done! 🎉`);
            // Trigger refresh event for task lists
            window.dispatchEvent(new CustomEvent('task-updated', { detail: { id: selectedTask._id, status: 'Done' } }));
        } catch {
            toast.error('Could not update task status');
        }
    }, [selectedTask]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    // Sync ambient sound changes while active
    useEffect(() => {
        if (isActive) {
            focusSound.setAmbientSound(settings.ambientSound);
        } else {
            focusSound.stopAmbient();
        }
    }, [isActive, settings.ambientSound]);

    return (
        <FocusContext.Provider
            value={{
                mode,
                timeLeft,
                totalDuration,
                progressPercent,
                isActive,
                selectedTask,
                settings,
                stats,
                currentRound,
                isModalOpen,
                isWidgetMinimized,
                breakPromptOpen,
                completedSessionData,
                startTimer,
                pauseTimer,
                resetTimer,
                skipTimer,
                setMode,
                selectTask,
                openFocusModal,
                closeFocusModal,
                toggleWidgetMinimized,
                updateSettings,
                closeBreakPrompt,
                claimCoffeeReward,
                markTaskComplete,
            }}
        >
            {children}
        </FocusContext.Provider>
    );
};

export const useFocus = (): FocusContextType => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};
