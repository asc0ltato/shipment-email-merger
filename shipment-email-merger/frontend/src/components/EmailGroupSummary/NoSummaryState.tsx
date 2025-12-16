export function NoAnalysisState() {
    return (
        <div className="h-full flex items-center justify-center text-slate-500 p-8">
            <div className="text-center space-y-3 -mt-8">
                <div className="w-16 h-16 bg-slate-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-600">Summary not generated yet</p>
                    <p className="text-xs text-slate-500">Click "Regenerate" to analyze emails</p>
                </div>
            </div>
        </div>
    );
}