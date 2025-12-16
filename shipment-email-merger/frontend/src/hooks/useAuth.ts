import { useState, useEffect, useRef } from 'react';
import { authApi } from '@/lib/api';
import { User } from '@/types/auth.types';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const authCheckedRef = useRef(false);

    useEffect(() => {
        if (!authCheckedRef.current) {
            checkAuth();
            authCheckedRef.current = true;
        }
    }, []);

    const checkAuth = async (): Promise<boolean> => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                setLoading(false);
                return false;
            }

            const response = await authApi.getUser();
            if (response.success && response.data?.user) {
                setUser(response.data.user);
                return true;
            } else {
                localStorage.removeItem('sessionId');
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('sessionId');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string): Promise<void> => {
        try {
            const response = await authApi.getAuthUrl(email);
            if (response.success && response.data?.authUrl) {
                window.location.href = response.data.authUrl;
            } else {
                throw new Error(response.message || 'Failed to get auth URL');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const handleCallback = async (code: string, email: string): Promise<boolean> => {
        try {
            const response = await authApi.authCallback(code, email, null);
            if (response.success && response.data?.sessionId) {
                localStorage.setItem('sessionId', response.data.sessionId);
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Callback failed:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('sessionCreated');
            setUser(null);
        }
    };

    return {
        user,
        setUser,
        loading,
        login,
        handleCallback,
        logout,
        checkAuth,
        isAuthenticated: !!user,
    };
};