'use client';

import { Toast, EmailList } from '@/components';
import { EmailGroupSummary } from '@/components/EmailGroupSummary/EmailGroupSummary';
import { EmailGroupList } from '@/components/EmailGroupList/EmailGroupList';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardHeader } from './DashboardHeader';
import { IEmailGroup } from '@/types/email-group.types';
import { User } from '@/types/auth.types';
import { EmailStats } from '@/types/api.types';

interface DashboardProps {
    initialData?: {
        user: User;
        emailGroups: IEmailGroup[];
        emailStats: EmailStats;
    };
}

export function Dashboard({ initialData }: DashboardProps) {
    const {
        user,
        isLoading,
        allEmailGroups,
        selectedEmailGroupId,
        isSyncing,
        isSyncingSummaries,
        isRegenerating,
        lastSyncTime,  
        toast,
        setToast,
        dateRange,
        setDateRange,
        selectedEmailGroup,
        handleSync,
        handleSyncSummaries,
        handleDeleteEmailGroup,
        handleRegenerateAI,
        handleDeleteSummary,
        handleApproveEmailGroup,
        handleRejectEmailGroup,
        handleLogout,
        handleEmailGroupRefresh,
        handleGroupUpdated,
        handleEmailGroupClick
    } = useDashboard({ initialData });

    if (isLoading && allEmailGroups.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading email groups...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <DashboardHeader
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onSync={handleSync}
                onSyncSummaries={handleSyncSummaries}
                onDeleteEmailGroup={handleDeleteEmailGroup}
                onLogout={handleLogout}
                isSyncing={isSyncing}
                isSyncingSummaries={isSyncingSummaries}
                lastSyncTime={lastSyncTime}
                selectedEmailGroupId={selectedEmailGroupId}
            />

            <main className="flex-1 p-4 bg-slate-100">
                <div className="max-w-screen-2xl mx-auto h-full">
                    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)] min-h-0">
                        <div className="col-span-3 h-full min-h-0 flex flex-col z-30">
                            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 min-h-0">
                                <EmailGroupList
                                    emailGroups={allEmailGroups}
                                    onEmailGroupSelect={handleEmailGroupClick}
                                    selectedEmailGroupId={selectedEmailGroupId}
                                    onEmailGroupRefresh={handleEmailGroupRefresh}
                                    onGroupUpdated={handleGroupUpdated}
                                />
                            </div>
                        </div>
                        <div className="col-span-5 h-full min-h-0 relative z-20">
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col min-h-0">
                                <EmailList
                                    emails={selectedEmailGroup?.emails || []}
                                    emailGroupId={selectedEmailGroup?.emailGroupId}
                                    onDeleteEmailGroup={handleDeleteEmailGroup}
                                />
                            </div>
                        </div>

                        <div className="col-span-4 h-full min-h-0 relative z-10">
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col min-h-0">
                                <EmailGroupSummary
                                    emailGroup={selectedEmailGroup}
                                    onApprove={handleApproveEmailGroup}
                                    onReject={handleRejectEmailGroup}
                                    onRegenerate={handleRegenerateAI}
                                    onDeleteSummary={handleDeleteSummary}
                                    isRegenerating={isRegenerating === selectedEmailGroup?.emailGroupId}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}