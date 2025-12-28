export interface AutoSyncStatus {
    isRunning: boolean;
    lastSyncTime: Date | null;
    formattedLastSyncTime: string;
    nextSyncTime: Date | null;
    formattedNextSyncTime: string;
}