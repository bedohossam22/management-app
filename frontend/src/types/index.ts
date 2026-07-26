// User types
export interface User {
    id: string;
    name: string;
    email: string;
    token: string;
}

// Task types
export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
    user: string;
    createdAt: string;
    updatedAt: string;
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    login: (credentials: LoginData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// Task form data
export interface TaskFormData {
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
}

// API Response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    errors?: any[];
}