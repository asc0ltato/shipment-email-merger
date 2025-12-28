import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useEmailGroups } from './useEmailGroups';
import { useSync } from './useSync';
import { useToast } from './useToast';
import { useSyncSummaries } from './useSyncSummaries';
import { useSessionSync } from './useSessionSync';
import { authApi } from '@/lib/api';
import { IEmailGroup } from '@/types/email-group.types';
import { User } from '@/types/auth.types';
import { EmailStats } from '@/types/api.types';

interface UseDashboardProps {
    initialData?: {
        user: User;
        emailGroups: IEmailGroup[];
        emailStats: EmailStats;
    };
}

export function useDashboard(props: UseDashboardProps = {}) {
    const { initialData } = props;
    const initializedRef = useRef(false);

    const { user, setUser, checkAuth, logout } = useAuth();
    const { toast, setToast, showToast } = useToast();
    const { syncSessionWithServer } = useSessionSync();

    const handleLogout = useCallback(async () => {
        await logout();
        window.location.href = '/';
    }, [logout]);

    const {
        allEmailGroups,
        selectedEmailGroupId,
        selectedEmailGroup,
        isRegenerating,
        setAllEmailGroups,
        setSelectedEmailGroupId,
        loadAllEmailGroups,
        handleEmailGroupRefresh,
        handleGroupUpdated,
        handleRegenerateAI,
        handleDeleteSummary,
        handleApproveEmailGroup,
        handleRejectEmailGroup,
        handleDeleteEmailGroup,
        handleEmailGroupClick: handleEmailGroupClickInternal
    } = useEmailGroups({
        initialEmailGroups: initialData?.emailGroups || [],
        showToast,
        checkAuth: checkAuth as () => Promise<boolean>,
        updateLastSyncTime: undefined
    });

    const {
        isSyncing,
        lastAutoSyncTime,
        dateRange,
        setDateRange,
        handleSync,
        updateAutoSyncTime
    } = useSync({
        showToast,
        updateLastSyncTime: undefined,
        setAllEmailGroups
    });

    const {
        isSyncing: isSyncingSummaries,
        handleSyncSummaries
    } = useSyncSummaries({
        showToast,
        setAllEmailGroups,
        loadAllEmailGroups
    });

    const [isLoading, setIsLoading] = useState(!initialData);

    useEffect(() => {
        if (initializedRef.current) {
            return;
        }

        const initializeDashboard = async () => {
            try {
                if (initialData?.user && initialData?.emailGroups) {
                    setUser(initialData.user);
                    setAllEmailGroups(initialData.emailGroups);
                    setIsLoading(false);
                    initializedRef.current = true;
                    return;
                }

                setIsLoading(true);
                
                const sessionId = localStorage.getItem('sessionId');
                if (sessionId) {
                    console.log('Syncing session with server on dashboard load...');
                    await syncSessionWithServer(sessionId);
                }

                const [authSuccess] = await Promise.all([
                    checkAuth(),
                    loadAllEmailGroups()
                ]);

                if (!authSuccess) {
                    console.log('Authentication failed, redirecting...');
                    await handleLogout();
                    return;
                }

                updateAutoSyncTime();
                initializedRef.current = true;
                
            } catch (error) {
                console.error('Dashboard initialization error:', error);
                showToast('Failed to initialize dashboard', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        initializeDashboard();

    }, [initialData, syncSessionWithServer, checkAuth, loadAllEmailGroups, setUser, setAllEmailGroups, handleLogout, showToast, updateAutoSyncTime]);

    const handleEmailGroupClick = async (emailGroupId: string) => {
        setSelectedEmailGroupId(emailGroupId);

        try {
            const sessionValid = await authApi.refreshSession();
            if (!sessionValid) {
                showToast('Session expired. Please log in again.', 'error');
                await handleLogout();
                return;
            }

            await handleEmailGroupClickInternal(emailGroupId);

        } catch (error: any) {
            console.error('Error in email group click:', error);

            if (error.message.includes('401') || error.message.includes('authentication')) {
                showToast('Session expired. Please log in again.', 'error');
                await handleLogout();
            } else {
                showToast(error.message || 'Error loading email group', 'error');
            }
        }
    };

    return {
        user,
        isLoading,
        allEmailGroups,
        selectedEmailGroupId,
        selectedEmailGroup,
        isSyncing,
        isSyncingSummaries,
        isRegenerating,
        lastSyncTime: lastAutoSyncTime,
        toast,
        dateRange,
        setSelectedEmailGroupId,
        setToast,
        setDateRange,
        showToast,
        handleSync,
        handleSyncSummaries,
        handleDeleteEmailGroup,
        handleRegenerateAI,
        handleDeleteSummary,
        handleApproveEmailGroup,
        handleRejectEmailGroup,
        handleLogout,
        loadAllEmailGroups,
        handleEmailGroupRefresh,
        handleGroupUpdated,
        handleEmailGroupClick,
    };
}