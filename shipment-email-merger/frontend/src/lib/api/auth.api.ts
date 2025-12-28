import { ApiResponse } from '@/types/api.types';
import { User, AuthCallbackData, AuthUrlData } from '@/types/auth.types';
import { baseApi } from './base.api';
import { logger } from '@/utils/logger';

export const authApi = {
    getAuthUrl: (email: string) => {
        return baseApi.get<ApiResponse<AuthUrlData>>(
            `/api/oauth/auth-url?email=${encodeURIComponent(email)}&t=${Date.now()}`
        );
    },

    authCallback: (code: string, email: string, state: string | null) => {
        return baseApi.post<ApiResponse<AuthCallbackData>>('/api/oauth/callback', {
            code,
            email,
            state
        });
    },

    getUser: () => {
        return baseApi.get<ApiResponse<{ user: User }>>('/api/oauth/user');
    },

    logout: () => {
        return baseApi.post<ApiResponse>('/api/oauth/logout');
    },

    refreshSession: async (): Promise<boolean> => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) return false;

            const response = await authApi.getUser();
            return response.success;
        } catch (error) {
            logger.error('Session refresh failed:', error);
            return false;
        }
    }
};