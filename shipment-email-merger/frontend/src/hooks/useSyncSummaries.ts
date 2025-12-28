import { useState, useCallback } from 'react';
import { emailGroupsApi } from '@/lib/api';
import { IEmailGroup } from '@/types/email-group.types';

interface UseSyncSummariesProps {
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
    setAllEmailGroups?: React.Dispatch<React.SetStateAction<IEmailGroup[]>>;
    loadAllEmailGroups?: () => Promise<void>;
}

export function useSyncSummaries(props: UseSyncSummariesProps = {}) {
    const { showToast, setAllEmailGroups, loadAllEmailGroups } = props;
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncSummaries = useCallback(async (): Promise<void> => {
        setIsSyncing(true);

        try {
            showToast?.('Starting AI summaries generation...', 'info');
            
            const result = await emailGroupsApi.generateAllSummaries();

            if (result.success && result.data) {
                const { processed, total } = result.data;
                
                if (processed > 0) {
                    showToast?.(`Generated ${processed} AI summaries (out of ${total} groups)`, 'success');
                    
                    if (loadAllEmailGroups) {
                        await loadAllEmailGroups();
                    }
                } else {
                    showToast?.(`All ${total} groups already have valid summaries`, 'info');
                }
            } else {
                showToast?.(result.message || 'Failed to generate AI summaries', 'error');
            }

        } catch (error: any) {
            showToast?.(error.message || 'Failed to generate AI summaries', 'error');
        } finally {
            setIsSyncing(false);
        }
    }, [showToast, loadAllEmailGroups]);

    return {
        isSyncing,
        handleSyncSummaries,
    };
}