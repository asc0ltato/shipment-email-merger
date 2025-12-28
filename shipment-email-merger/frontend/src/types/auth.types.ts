export interface User {
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        sessionId: string;
    };
}

export interface AuthUrlResponse {
    success: boolean;
    message: string;
    data: {
        authUrl: string;
    };
}

export interface AuthCallbackData {
    sessionId: string;
    user: User;
    message: string;
}

export interface AuthUrlData {
    authUrl: string;
}