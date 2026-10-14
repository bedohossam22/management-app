export type FocusMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export type AmbientSoundType = 'none' | 'clock' | 'rain' | 'cafe';

export interface FocusSettings {
    workDuration: number; // in minutes (e.g. 25)
    shortBreakDuration: number; // in minutes (e.g. 5)
    longBreakDuration: number; // in minutes (e.g. 15)
    longBreakInterval: number; // sessions before long break (e.g. 4)
    soundEnabled: boolean;
    tickingEnabled: boolean;
    ambientSound: AmbientSoundType;
}

export interface FocusSession {
    id: string;
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    mode: FocusMode;
    completedAt: string;
}

export interface FocusStats {
    todayDate: string;
    completedPomodoros: number;
    totalFocusMinutes: number;
    dailyTarget: number;
    totalAllTimePomodoros: number;
    totalAllTimeMinutes: number;
    recentSessions: FocusSession[];
}

export interface FocusTaskSummary {
    id: string;
    title: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'To Do' | 'In Progress' | 'Done';
}
