import { IEmailGroup } from '@/types/email-group.types';

interface EmailGroupItemProps {
    emailGroup: IEmailGroup;
    isSelected: boolean;
    isRefreshing?: boolean;
    onClick: () => void;
}

const getStatusColors = (status: string) => {
    switch (status) {
        case 'approved':
            return {
                bg: 'bg-green-500',
                text: 'text-green-700',
                light: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-100 text-green-800 border-green-200'
            };
        case 'pending':
            return {
                bg: 'bg-yellow-500',
                text: 'text-yellow-700',
                light: 'bg-yellow-50',
                border: 'border-yellow-200',
                badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            };
        case 'rejected':
            return {
                bg: 'bg-red-500',
                text: 'text-red-700',
                light: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-800 border-red-200'
            };
        case 'failed':
            return {
                bg: 'bg-orange-500',
                text: 'text-orange-700',
                light: 'bg-orange-50',
                border: 'border-orange-200',
                badge: 'bg-orange-100 text-orange-800 border-orange-200'
            };
        case 'processing':
            return {
                bg: 'bg-blue-500',
                text: 'text-blue-700',
                light: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-800 border-blue-200'
            };
        default:
            return {
                bg: 'bg-slate-500',
                text: 'text-slate-700',
                light: 'bg-slate-50',
                border: 'border-slate-200',
                badge: 'bg-slate-100 text-slate-800 border-slate-200'
            };
    }
};

const getStatusIcon = (status: string, isRefreshing?: boolean) => {
    if (isRefreshing) {
        return (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        );
    }

    switch (status) {
        case 'approved':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            );
        case 'pending':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
        case 'rejected':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            );
        case 'processing':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            );
        case 'failed':
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            );
        default:
            return (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            );
    }
};

const getEmailGroupStatus = (emailGroup: IEmailGroup): { status: string; displayText: string } => {
    if (emailGroup.summary && emailGroup.summary.status) {
        return {
            status: emailGroup.summary.status,
            displayText: emailGroup.summary.status.charAt(0).toUpperCase() + emailGroup.summary.status.slice(1)
        };
    }

    if (emailGroup.summaries && emailGroup.summaries.length > 0) {
        const pendingSummary = emailGroup.summaries.find(s => 
            s.status === 'pending' || s.status === 'processing'
        );
        if (pendingSummary) {
            return {
                status: pendingSummary.status,
                displayText: pendingSummary.status.charAt(0).toUpperCase() + pendingSummary.status.slice(1)
            };
        }

        const approvedRejectedSummary = emailGroup.summaries.find(s => 
            s.status === 'approved' || s.status === 'rejected'
        );
        if (approvedRejectedSummary) {
            return {
                status: approvedRejectedSummary.status,
                displayText: approvedRejectedSummary.status.charAt(0).toUpperCase() + approvedRejectedSummary.status.slice(1)
            };
        }

        const failedSummary = emailGroup.summaries.find(s => s.status === 'failed');
        if (failedSummary) {
            return {
                status: 'failed',
                displayText: 'Failed'
            };
        }
    }
    
    return {
        status: 'not-processed',
        displayText: 'Not processed'
    };
};

export function EmailGroupItem({ emailGroup, isSelected, isRefreshing = false, onClick }: EmailGroupItemProps) {
    const { status, displayText } = getEmailGroupStatus(emailGroup);
    const colors = getStatusColors(status);

    return (
        <div
            className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected
                    ? `border-slate-400 bg-slate-50 shadow-sm ${colors.light}`
                    : `border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300`
            } ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}
            onClick={isRefreshing ? undefined : onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center relative`}>
                        {getStatusIcon(status, isRefreshing)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm truncate">
                            {emailGroup.emailGroupId}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${colors.badge} border ${colors.border} mt-1`}>
                            {getStatusIcon(status, isRefreshing)}
                            <span>
                                {isRefreshing ? 'Refreshing...' : displayText}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 ml-2">
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(emailGroup.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>

                    {isSelected && !isRefreshing && (
                        <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    )}

                    {isRefreshing && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`absolute left-0 top-2 bottom-2 w-1 ${colors.bg} rounded-r`}></div>
        </div>
    );
}