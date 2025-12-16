import { ApiResponse } from '@/types/api.types';
import { baseApi } from './base.api';

export interface AutoSyncStatus {
    isRunning: boolean;
    lastSyncTime: string | null;
    formattedLastSyncTime: string;
    nextSyncTime: string | null;
    formattedNextSyncTime: string;
}

export const syncApi = {
    getAutoSyncStatus: () => {
        return baseApi.get<ApiResponse<AutoSyncStatus>>('/api/auto-sync/status');
    }
};