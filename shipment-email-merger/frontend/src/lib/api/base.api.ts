const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

const handleAuthError = async (error: any): Promise<never> => {
    console.error('Authentication error:', error);
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

        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`API Request: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            console.log(`API Response: ${response.status} ${response.statusText}`);

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
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);
            return data;
        } catch (error: any) {
            console.error('API request failed:', error);

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

        const url = `${API_BASE_URL}${endpoint}`;
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