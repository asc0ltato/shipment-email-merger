import { useCallback } from 'react';

export function useSessionSync() {
    const syncSessionWithServer = useCallback(async (sessionId: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/sync-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });

            const result = await response.json();
            console.log('Session sync result:', result);
            return result.success;
        } catch (error) {
            console.error('Failed to sync session with server:', error);
            return false;
        }
    }, []);

    return {
        syncSessionWithServer
    };
}