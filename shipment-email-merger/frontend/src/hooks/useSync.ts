import { useState, useCallback, useEffect, useMemo } from 'react';
import { emailGroupsApi, syncApi } from '@/lib/api';
import { IEmailGroup } from '@/types/email-group.types';
import { logger } from '@/utils/logger';

interface UseSyncProps {
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    updateLastSyncTime?: () => void;
    setAllEmailGroups?: React.Dispatch<React.SetStateAction<IEmailGroup[]>>;
}

const formatTimeAgo = (lastSyncTime: Date | null): string => {
    if (!lastSyncTime) return 'Never';
    
    const diffMs = Date.now() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

export function useSync(props: UseSyncProps = {}) {
    const { showToast, updateLastSyncTime, setAllEmailGroups } = props;

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    const formattedLastSyncTime = useMemo(() => {
        return formatTimeAgo(lastSyncTime);
    }, [lastSyncTime]);

    const fetchAutoSyncStatus = useCallback(async () => {
        try {
            const response = await syncApi.getAutoSyncStatus();
            if (response.success && response.data?.lastSyncTime) {
                const syncDate = new Date(response.data.lastSyncTime);
                if (!isNaN(syncDate.getTime())) {
                    setLastSyncTime(syncDate);
                }
            }
        } catch (error) {
            logger.warn('Failed to fetch auto sync status:', error);
        }
    }, []);

    useEffect(() => {
        fetchAutoSyncStatus();

        const handleFocus = () => {
            fetchAutoSyncStatus();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchAutoSyncStatus]);

    const updateAutoSyncTime = useCallback(() => {
        fetchAutoSyncStatus();
    }, [fetchAutoSyncStatus]);

    const updateLastSyncTimeInternal = useCallback(() => {
        setLastSyncTime(new Date());
    }, []);

    const handleSync = useCallback(async (): Promise<void> => {
        setIsSyncing(true);

        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                showToast?.('Session not found.', 'error');
                return;
            }

            let result;
            if (dateRange.startDate || dateRange.endDate) {
                let formattedStartDate = dateRange.startDate;
                let formattedEndDate = dateRange.endDate;

                if (dateRange.startDate && dateRange.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const parts = dateRange.startDate.split('-');
                    formattedStartDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                if (dateRange.endDate && dateRange.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const parts = dateRange.endDate.split('-');
                    formattedEndDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                result = await emailGroupsApi.syncEmails(formattedStartDate, formattedEndDate);
            } else {
                result = await emailGroupsApi.syncEmails();
            }

            if (result.success && result.data) {
                const createdGroups = result.data.createdGroups || [];
                if (createdGroups.length > 0) {
                    setAllEmailGroups?.(prev => {
                        const newGroups = [...createdGroups, ...prev];
                        logger.log(`Added ${createdGroups.length} new groups from sync`);
                        return newGroups;
                    });
                }

                const message = `Sync completed! Email groups created: ${result.data.created}, Updated: ${result.data.updated}, New emails: ${result.data.newEmails}`;
                showToast?.(message, 'success');
            } else {
                showToast?.(result.message || 'Sync failed', 'error');
            }
        } catch (error: any) {
            showToast?.(error.message, 'error');
        } finally {
            setIsSyncing(false);
        }
    }, [dateRange, showToast, setAllEmailGroups]);

    return {
        isSyncing,
        lastSyncTime,
        lastAutoSyncTime: formattedLastSyncTime,
        dateRange,
        setDateRange,
        handleSync,
        fetchAutoSyncStatus,
        updateAutoSyncTime,
        updateLastSyncTime: updateLastSyncTimeInternal
    };
}