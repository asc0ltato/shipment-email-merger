import { IEmailGroup } from '@/types/email-group.types';
import { SummaryTabs } from './SummaryTabs';

interface SummaryHeaderProps {
    emailGroup: IEmailGroup | undefined;
    hasAIAnalysis?: boolean;
    showTabs?: boolean;
    viewMode: 'summary' | 'json';
    onViewModeChange: (mode: 'summary' | 'json') => void;
}

export function SummaryHeader({
                                  emailGroup,
                                  hasAIAnalysis,
                                  showTabs,
                                  viewMode,
                                  onViewModeChange
                              }: SummaryHeaderProps) {
    const getSubtitle = () => {
        if (!emailGroup) return 'Select an email group to view summary';
        return hasAIAnalysis ? 'Summary report' : 'No summary available';
    };

    return (
        <div className="p-4 border-b border-slate-200/60 flex-shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 truncate">
                            {emailGroup ? emailGroup.emailGroupId : 'Summary'}
                        </h2>
                         <p className="text-sm text-slate-600 mt-1">
                            {getSubtitle()}
                        </p>
                    </div>
                </div>

                {showTabs && (
                    <SummaryTabs
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                )}
            </div>
        </div>
    );
}