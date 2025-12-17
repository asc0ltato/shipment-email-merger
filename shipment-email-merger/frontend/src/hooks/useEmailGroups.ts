import { useState, useCallback, useRef } from 'react';
import { IEmailGroup } from '@/types/email-group.types';
import { emailGroupsApi } from '@/lib/api';
import { logger } from '@/utils/logger';

interface UseEmailGroupsProps {
    initialEmailGroups?: IEmailGroup[];
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    checkAuth?: () => Promise<boolean>;
    updateLastSyncTime?: () => void;
}

export function useEmailGroups(props: UseEmailGroupsProps = {}) {
    const { initialEmailGroups = [], showToast, checkAuth, updateLastSyncTime } = props;

    const [allEmailGroups, setAllEmailGroups] = useState<IEmailGroup[]>(initialEmailGroups);
    const [selectedEmailGroupId, setSelectedEmailGroupId] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isUpdatingRef = useRef(false);
    const pendingOperationsRef = useRef<Set<string>>(new Set());

    const selectedEmailGroup = allEmailGroups.find(s => s.emailGroupId === selectedEmailGroupId);

    const loadAllEmailGroups = useCallback(async (): Promise<void> => {
        if (isUpdatingRef.current) {
            logger.log('Update already in progress, skipping...');
            return;
        }

        isUpdatingRef.current = true;
        setIsLoading(true);

        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                logger.log('No session ID found');
                return;
            }

            const data = await emailGroupsApi.getAllEmailGroups();

            if (data.success && data.data) {
                const newEmailGroups = data.data.emailGroups || [];
                setAllEmailGroups(newEmailGroups);
                logger.log(`Loaded ${newEmailGroups.length} email groups`);
            } else {
                showToast?.(data.message || 'Failed to load email groups', 'error');
            }
        } catch (error: any) {
            logger.error('Error loading email groups:', error);

            if (error.message.includes('401') || error.message.includes('authentication')) {
                logger.warn('Session may have expired');
                await checkAuth?.();
            } else {
                showToast?.(error.message || 'Error loading email groups', 'error');
            }
        } finally {
            isUpdatingRef.current = false;
            setIsLoading(false);
        }
    }, [showToast, checkAuth]);

    const handleEmailGroupClick = useCallback(async (emailGroupId: string): Promise<void> => {
        if (pendingOperationsRef.current.has(emailGroupId)) {
            logger.log(`Operation for ${emailGroupId} already in progress, skipping...`);
            return;
        }

        pendingOperationsRef.current.add(emailGroupId);
        setSelectedEmailGroupId(emailGroupId);

        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                showToast?.('Session expired. Please log in again.', 'error');
                setSelectedEmailGroupId(null);
                pendingOperationsRef.current.delete(emailGroupId);
                updateLastSyncTime?.();
                return;
            }

            const result = await emailGroupsApi.refreshEmailGroup(emailGroupId);

            if (result.success && result.data?.emailGroup) {
                setAllEmailGroups(prev => {
                    const groupIndex = prev.findIndex(group => group.emailGroupId === emailGroupId);
                    if (groupIndex >= 0) {
                        const newGroups = [...prev];
                        newGroups[groupIndex] = result.data!.emailGroup;
                        return newGroups;
                    } else {
                        return [result.data!.emailGroup, ...prev];
                    }
                });

                if (result.data.newEmails && result.data.newEmails > 0) {
                    showToast?.(`Found ${result.data.newEmails} new emails for group ${emailGroupId}`, 'success');
                }
            } else {
                showToast?.(result.message || 'Failed to refresh group', 'error');
            }
        } catch (error: any) {
            logger.error('Error refreshing email group:', error);
            if (error.message?.includes('429')) {
                showToast?.('Refresh already in progress for this group. Please wait.', 'info');
            } else if (error.message?.includes('401') || error.message?.includes('authentication')) {
                showToast?.('Session expired. Please log in again.', 'error');
                setSelectedEmailGroupId(null);

                localStorage.removeItem('sessionId');
            } else {
                showToast?.('Error refreshing group: ' + (error.message || error.toString()), 'error');
            }
        } finally {
            pendingOperationsRef.current.delete(emailGroupId);
        }
    }, [showToast, updateLastSyncTime]);

    const handleGroupUpdated = useCallback((emailGroupId: string, updatedGroup: IEmailGroup, isNewGroup: boolean = false) => {
        logger.log('Updating group:', { emailGroupId, isNewGroup });

        setAllEmailGroups(prev => {
            if (isNewGroup) {
                return [updatedGroup, ...prev.filter(group => group.emailGroupId !== emailGroupId)];
            } else {
                const groupIndex = prev.findIndex(group => group.emailGroupId === emailGroupId);
                if (groupIndex >= 0) {
                    const newGroups = [...prev];
                    newGroups[groupIndex] = updatedGroup;
                    return newGroups;
                } else {
                    return [updatedGroup, ...prev];
                }
            }
        });
    }, []);

    const handleRegenerateAI = useCallback(async (emailGroupId: string): Promise<void> => {
        if (pendingOperationsRef.current.has(emailGroupId)) {
            logger.log(`Regeneration for ${emailGroupId} already in progress`);
            return;
        }

        pendingOperationsRef.current.add(emailGroupId);
        setIsRegenerating(emailGroupId);

        try {
            setAllEmailGroups(prev =>
                prev.map(emailGroup =>
                    emailGroup.emailGroupId === emailGroupId
                        ? {
                            ...emailGroup,
                            summary: emailGroup.summary ? {
                                ...emailGroup.summary,
                                status: 'processing' as const
                            } : undefined,
                            emails: emailGroup.emails?.map(email => ({
                                ...email,
                                status: 'processing' as const
                            }))
                        }
                        : emailGroup
                )
            );

            const result = await emailGroupsApi.regenerateEmailGroupAI(emailGroupId);

            if (result.success && result.data) {
                setAllEmailGroups(prev =>
                    prev.map(emailGroup =>
                        emailGroup.emailGroupId === emailGroupId
                            ? result.data!
                            : emailGroup
                    )
                );
                showToast?.('AI analysis completed successfully!', 'success');
            } else {
                showToast?.(result.message || 'Error regenerating AI analysis', 'error');

                await loadAllEmailGroups();
            }
        } catch (error: any) {
            logger.error('Error regenerating AI:', error);
            showToast?.(error.message || 'Error regenerating AI analysis', 'error');

            await loadAllEmailGroups();
        } finally {
            pendingOperationsRef.current.delete(emailGroupId);
            setIsRegenerating(null);
        }
    }, [showToast, loadAllEmailGroups]);


    const handleDeleteSummary = useCallback(async (emailGroupId: string): Promise<void> => {
        if (pendingOperationsRef.current.has(emailGroupId)) {
            logger.log(`Delete operation for ${emailGroupId} already in progress`);
            return;
        }

        pendingOperationsRef.current.add(emailGroupId);

        try {
            const data = await emailGroupsApi.deleteEmailGroupSummary(emailGroupId);
            if (data.success && data.data) {
                setAllEmailGroups(prev =>
                    prev.map(emailGroup =>
                        emailGroup.emailGroupId === emailGroupId
                            ? data.data!
                            : emailGroup
                    )
                );
                
                showToast?.('AI analysis deleted successfully', 'success');
            } else {
                showToast?.(data.message || 'Error deleting AI analysis', 'error');
            }
        } catch (error: any) {
            logger.error('Error deleting summary:', error);
            showToast?.(error.message || 'Error deleting AI analysis', 'error');
        } finally {
            pendingOperationsRef.current.delete(emailGroupId);
        }
    }, [showToast]);

    const handleDeleteEmailGroup = useCallback(async (): Promise<void> => {
        if (!selectedEmailGroupId) {
            showToast?.('Please select an email group to delete', 'error');
            return;
        }

        if (pendingOperationsRef.current.has(selectedEmailGroupId)) {
            console.log(`Delete operation for ${selectedEmailGroupId} already in progress`);
            return;
        }

        if (!confirm(`Are you sure you want to delete email group ${selectedEmailGroupId}? This action cannot be undone.`)) {
            return;
        }

        pendingOperationsRef.current.add(selectedEmailGroupId);

        try {
            const data = await emailGroupsApi.deleteEmailGroup(selectedEmailGroupId);
            if (data.success) {
                setAllEmailGroups(prev =>
                    prev.filter(group => group.emailGroupId !== selectedEmailGroupId)
                );
                setSelectedEmailGroupId(null);
                showToast?.('Email group deleted successfully', 'success');
            } else {
                showToast?.(data.message || 'Error deleting email group', 'error');
            }
        } catch (error: any) {
            logger.error('Error deleting email group:', error);
            showToast?.(error.message || 'Error deleting email group', 'error');
        } finally {
            pendingOperationsRef.current.delete(selectedEmailGroupId);
        }
    }, [selectedEmailGroupId, showToast]);

    const handleApproveEmailGroup = useCallback(async (emailGroupId: string): Promise<void> => {
        if (pendingOperationsRef.current.has(emailGroupId)) {
            logger.log(`Approve operation for ${emailGroupId} already in progress`);
            return;
        }

        pendingOperationsRef.current.add(emailGroupId);

        try {
            const data = await emailGroupsApi.approveEmailGroup(emailGroupId);
            if (data.success) {
                setAllEmailGroups(prev =>
                    prev.map(group =>
                        group.emailGroupId === emailGroupId
                            ? {
                                ...group,
                                summary: group.summary ? { ...group.summary, status: 'approved' as const } : undefined
                            }
                            : group
                    )
                );
                showToast?.('Email group approved successfully', 'success');
            } else {
                showToast?.(data.message || 'Error approving email group', 'error');
            }
        } catch (error: any) {
            logger.error('Error approving email group:', error);
            showToast?.(error.message || 'Error approving email group', 'error');
        } finally {
            pendingOperationsRef.current.delete(emailGroupId);
        }
    }, [showToast]);

    const handleRejectEmailGroup = useCallback(async (emailGroupId: string): Promise<void> => {
        if (pendingOperationsRef.current.has(emailGroupId)) {
            logger.log(`Reject operation for ${emailGroupId} already in progress`);
            return;
        }

        pendingOperationsRef.current.add(emailGroupId);

        try {
            const data = await emailGroupsApi.rejectEmailGroup(emailGroupId);
            if (data.success) {
                setAllEmailGroups(prev =>
                    prev.map(group =>
                        group.emailGroupId === emailGroupId
                            ? {
                                ...group,
                                summary: group.summary ? { ...group.summary, status: 'rejected' as const } : undefined
                            }
                            : group
                    )
                );
                showToast?.('Email group rejected successfully', 'success');
            } else {
                showToast?.(data.message || 'Error rejecting email group', 'error');
            }
        } catch (error: any) {
            logger.error('Error rejecting email group:', error);
            showToast?.(error.message || 'Error rejecting email group', 'error');
        } finally {
            pendingOperationsRef.current.delete(emailGroupId);
        }
    }, [showToast]);

    const handleEmailGroupRefresh = useCallback((emailGroupId: string, updatedGroup: IEmailGroup, isNewGroup: boolean = false) => {
        logger.log('Refreshing group from external source:', { emailGroupId, isNewGroup });
        handleGroupUpdated(emailGroupId, updatedGroup, isNewGroup);
    }, [handleGroupUpdated]);

    return {
        allEmailGroups,
        selectedEmailGroupId,
        selectedEmailGroup,
        isRegenerating,
        isLoading,
        setAllEmailGroups,
        setSelectedEmailGroupId,
        loadAllEmailGroups,
        handleEmailGroupClick,
        handleEmailGroupRefresh,
        handleGroupUpdated,
        handleRegenerateAI,
        handleDeleteSummary,
        handleDeleteEmailGroup,
        handleApproveEmailGroup,
        handleRejectEmailGroup,
        hasPendingOperations: pendingOperationsRef.current.size > 0
    };
}