import { DateRangeSelect } from '@/components/DateRangeSelect/DateRangeSelect';

interface DashboardHeaderProps {
    dateRange: { startDate: string; endDate: string };
    onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
    onSync: () => void;
    onSyncSummaries: () => void;
    onDeleteEmailGroup: () => void;
    onLogout: () => void;
    isSyncing: boolean;
    isSyncingSummaries: boolean;
    lastSyncTime: string;
    selectedEmailGroupId: string | null;
}

export function DashboardHeader({
    dateRange,
    onDateRangeChange,
    onSync,
    onSyncSummaries,
    onDeleteEmailGroup,
    onLogout,
    isSyncing,
    isSyncingSummaries,
    lastSyncTime,
    selectedEmailGroupId,
}: DashboardHeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-4 z-30 sticky top-0">
            <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center rounded-xl shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div className="absolute -inset-1 border-2 border-white/30 rounded-xl animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 hidden md:block">Shipment Email Merger</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">
                                Last auto-sync: {lastSyncTime}
                            </p>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Auto-sync active" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DateRangeSelect
                        value={dateRange}
                        onChange={onDateRangeChange}
                    />

                    <button
                        onClick={onSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync emails'}</span>
                    </button>

                    <button
                        onClick={onSyncSummaries}
                        disabled={isSyncingSummaries}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <span className="hidden sm:inline">
                            {isSyncingSummaries ? 'Syncing...' : 'Sync summaries'}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onLogout}
                        className="bg-white/80 border border-slate-300 hover:border-slate-400 text-slate-600 font-medium p-2.5 rounded-xl transition-all duration-200 hover:shadow-md hover:bg-white"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}