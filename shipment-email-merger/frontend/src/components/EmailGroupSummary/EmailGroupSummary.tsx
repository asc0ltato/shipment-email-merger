import { IEmailGroup } from '@/types/email-group.types';
import { useState, useEffect } from 'react';
import { AIAnalysisView } from './SummaryView';
import { JSONView } from './JSONView';
import { SummaryHeader } from './SummaryHeader';
import { SummaryActions } from './SummaryActions';
import { EmptyState } from './EmptyState';
import { NoAnalysisState } from './NoSummaryState';
import { AttachmentSection } from './AttachmentSection';

interface EmailGroupSummaryProps {
    emailGroup: IEmailGroup | undefined;
    onApprove: (emailGroupId: string) => void;
    onReject: (emailGroupId: string) => void;
    onRegenerate: (emailGroupId: string) => Promise<void>;
    onDeleteSummary: (emailGroupId: string) => void;
    isRegenerating?: boolean;
}

export function EmailGroupSummary({
                                      emailGroup,
                                      onApprove,
                                      onReject,
                                      onRegenerate,
                                      onDeleteSummary,
                                      isRegenerating = false
                                  }: EmailGroupSummaryProps) {
    const [viewMode, setViewMode] = useState<'summary' | 'json'>('summary');

    useEffect(() => {
        setViewMode('summary');
    }, [emailGroup?.emailGroupId, emailGroup?.summary?.shipment_data]);

    const getAllAttachments = (): any[] => {
        if (!emailGroup?.emails) return [];
        
        const allAttachments: any[] = [];
        emailGroup.emails.forEach(email => {
            if (email.attachments && email.attachments.length > 0) {
                allAttachments.push(...email.attachments);
            }
        });
        
        return allAttachments;
    };

    const attachments = getAllAttachments();
    const hasShipmentData = !!emailGroup?.summary?.shipment_data;
        
    const hasSummary = !!emailGroup?.summary;

    const showTabs = hasShipmentData;

    const downloadJson = () => {
        if (!emailGroup || !emailGroup.summary?.shipment_data) return;

        const blob = new Blob([JSON.stringify(emailGroup.summary.shipment_data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-group-${emailGroup.emailGroupId}-ai-analysis.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

   const renderContent = () => {
    if (!emailGroup) {
        return <EmptyState />;
    }

    const isProcessing = emailGroup?.summary?.status === 'processing' || 
                        (emailGroup?.summaries && emailGroup.summaries.some(s => s.status === 'processing'));
    
    if (isProcessing) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 p-15">
                <div className="text-center space-y-3 -mt-8">
                    <div className="w-16 h-16 bg-blue-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">AI analysis in progress</p>
                    <p className="text-xs text-slate-500">Processing emails, please wait...</p>
                </div>
            </div>
        );
    }

    if (!hasSummary) {
        return <NoAnalysisState />;
    }

    return viewMode === 'summary' ? (
        <div className="space-y-6">
            <AIAnalysisView emailGroup={emailGroup}/>
            {attachments.length > 0 && (
                <AttachmentSection 
                    attachments={attachments} 
                    emailGroupId={emailGroup.emailGroupId} 
                />
            )}
        </div>
    ) : (
        <JSONView emailGroup={emailGroup} onDownloadJson={downloadJson} />
    );
};

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col relative">
            <SummaryHeader
                emailGroup={emailGroup}
                hasAIAnalysis={hasShipmentData}
                showTabs={showTabs}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {renderContent()}
            </div>

            <SummaryActions
                emailGroup={emailGroup}
                hasAIAnalysis={hasShipmentData}
                isRegenerating={isRegenerating}
                onApprove={onApprove}
                onReject={onReject}
                onRegenerate={onRegenerate}
                onDeleteSummary={onDeleteSummary}
            />
        </div>
    );
}