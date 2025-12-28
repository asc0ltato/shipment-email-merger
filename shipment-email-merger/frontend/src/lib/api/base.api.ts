import { logger } from '@/utils/logger';

const getBaseUrl = (): string => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return url.replace(/\/+$/, '');
};

const normalizeEndpoint = (endpoint: string): string => {
    return '/' + endpoint.replace(/^\/+/, '');
};

const API_BASE_URL = getBaseUrl();

const handleAuthError = async (error: any): Promise<never> => {
    logger.error('Authentication error:', error);
    localStorage.clear();

    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }

    throw new Error('Session expired. Please log in again.');
};

export const baseApi = {
    async request<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
        const sessionId = localStorage.getItem('sessionId');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (sessionId) {
            headers['Authorization'] = `Bearer ${sessionId}`;
        }

        const normalizedEndpoint = normalizeEndpoint(endpoint);
        const url = `${API_BASE_URL}${normalizedEndpoint}`;
        logger.log(`API Request: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            logger.log(`API Response: ${response.status} ${response.statusText}`);

            if (response.status === 401) {
                return handleAuthError(new Error('Unauthorized'));
            }

            if (response.status === 429) {
                if (retryCount < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return this.request<T>(endpoint, options, retryCount + 1);
                }
                throw new Error('Too many requests. Please try again later.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            logger.log('API Response data:', data);
            return data;
        } catch (error: any) {
            logger.error('API request failed:', error);

            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return handleAuthError(error);
            }

            throw error;
        }
    },

    async rawRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const sessionId = localStorage.getItem('sessionId');
        const headers: Record<string, string> = {};

        if (sessionId) {
            headers['Authorization'] = `Bearer ${sessionId}`;
        }

        const normalizedEndpoint = normalizeEndpoint(endpoint);
        const url = `${API_BASE_URL}${normalizedEndpoint}`;
        return fetch(url, { ...options, headers });
    },

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    },

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
};