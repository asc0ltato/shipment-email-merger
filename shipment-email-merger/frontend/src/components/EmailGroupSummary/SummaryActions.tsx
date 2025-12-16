import { IEmailGroup } from '@/types';

interface SummaryActionsProps {
    emailGroup: IEmailGroup | undefined;
    hasAIAnalysis?: boolean;
    isRegenerating?: boolean;
    onApprove: (emailGroupId: string) => void;
    onReject: (emailGroupId: string) => void;
    onRegenerate: (emailGroupId: string) => Promise<void>;
    onDeleteSummary: (emailGroupId: string) => void;
}

export function SummaryActions({
                                   emailGroup,
                                   hasAIAnalysis,
                                   isRegenerating = false,
                                   onApprove,
                                   onReject,
                                   onRegenerate,
                                   onDeleteSummary
                               }: SummaryActionsProps) {
    if (!emailGroup) return null;

    let summaryStatus: string | null = null;
    
    if (emailGroup.summary && emailGroup.summary.status) {
        summaryStatus = emailGroup.summary.status;
    } else if (emailGroup.summaries && emailGroup.summaries.length > 0) {
        const pendingSummary = emailGroup.summaries.find(s => 
            s.status === 'pending' || s.status === 'processing'
        );
        if (pendingSummary) {
            summaryStatus = pendingSummary.status;
        } else {
            const approvedRejectedSummary = emailGroup.summaries.find(s => 
                s.status === 'approved' || s.status === 'rejected'
            );
            if (approvedRejectedSummary) {
                summaryStatus = approvedRejectedSummary.status;
            } else {
                const failedSummary = emailGroup.summaries.find(s => s.status === 'failed');
                if (failedSummary) {
                    summaryStatus = 'failed';
                }
            }
        }
    }
    

    const canApproveReject = hasAIAnalysis && 
        summaryStatus !== 'failed' && 
        summaryStatus !== 'processing' &&
        summaryStatus !== null &&
        (summaryStatus === 'pending' || summaryStatus === 'approved' || summaryStatus === 'rejected');

    const hasProcessingEmails = emailGroup.emails && emailGroup.emails.some(email => email.status === 'processing');
    
    const canDeleteAI = hasAIAnalysis && 
        summaryStatus !== 'processing' && 
        !hasProcessingEmails &&
        !(isRegenerating && summaryStatus === 'failed');

    return (
        <div className="p-3 border-t border-slate-200/60 bg-white/50 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 text-sm">
                {canApproveReject ? (
                    <>
                        <button
                            onClick={() => onApprove(emailGroup.emailGroupId)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onReject(emailGroup.emailGroupId)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            disabled
                            className="bg-gradient-to-r from-green-300 to-green-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
                        >
                            Approve
                        </button>
                        <button
                            disabled
                            className="bg-gradient-to-r from-red-300 to-red-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
                        >
                            Reject
                        </button>
                    </>
                )}

                <button
                    onClick={() => onRegenerate(emailGroup.emailGroupId)}
                    disabled={isRegenerating}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
                >
                    {isRegenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Regenerate
                        </>
                    )}
                </button>

                <button
                    onClick={() => onDeleteSummary(emailGroup.emailGroupId)}
                    disabled={!canDeleteAI}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    );
}