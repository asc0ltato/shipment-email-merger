interface SummaryTabsProps {
    viewMode: 'summary' | 'json';
    onViewModeChange: (mode: 'summary' | 'json') => void;
}

export function SummaryTabs({ viewMode, onViewModeChange }: SummaryTabsProps) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => onViewModeChange('summary')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'summary'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                Text
            </button>
            <button
                onClick={() => onViewModeChange('json')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'json'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                JSON
            </button>
        </div>
    );
}