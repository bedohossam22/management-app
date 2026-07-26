import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthContextType, RegisterData, LoginData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const getErrorMessage = (err: any, fallback: string): string => {
        if (err.response?.data?.message) {
            return err.response.data.message;
        }
        if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length > 0) {
            return err.response.data.errors[0]?.msg || fallback;
        }
        if (err.message) {
            return err.message;
        }
        return fallback;
    };

    const register = async (userData: RegisterData) => {
        try {
            setError(null);
            const response = await api.post('/auth/register', userData);
            const { data } = response.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error: any) {
            const message = getErrorMessage(error, 'Registration failed');
            setError(message);
            return { success: false, error: message };
        }
    };

    const login = async (credentials: LoginData) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', credentials);
            const { data } = response.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error: any) {
            const message = getErrorMessage(error, 'Login failed');
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};