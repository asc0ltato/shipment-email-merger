import { IEmailGroup } from '@/types/email-group.types';

interface JSONViewProps {
    emailGroup: IEmailGroup;
    onDownloadJson: () => void;
}

export function JSONView({ emailGroup, onDownloadJson }: JSONViewProps) {
    const shipmentData = emailGroup.summary?.shipment_data;

    if (!shipmentData) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>No AI analysis data available</p>
            </div>
        );
    }

    const jsonString = JSON.stringify(shipmentData, null, 2);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 bg-slate-900 rounded-xl border border-slate-700 overflow-auto relative">
                <button
                    onClick={onDownloadJson}
                    className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors duration-200 text-xs border border-slate-600 shadow-lg"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                </button>
                <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed p-4">
                    {jsonString}
                </pre>
            </div>
        </div>
    );
}