'use client';

import { useEffect, useState } from 'react';

interface ApprovedSummaryEvent {
    emailGroupId: string;
    aiAnalysis: any;
}

const getBackendUrl = () => {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

export default function SseTestPage() {
    const [events, setEvents] = useState<ApprovedSummaryEvent[]>([]);
    const [status, setStatus] = useState<string>('Connecting...');

    useEffect(() => {
        const backendUrl = getBackendUrl();
        const url = `${backendUrl.replace(/\/$/, '')}/api/email-groups/approved/sse`;

        setStatus(`Connecting to ${url} ...`);

        const source = new EventSource(url, { withCredentials: true });

        source.addEventListener('open', () => {
            setStatus('Connected. Waiting for approved summaries...');
        });

        source.addEventListener('approved_summary', (event: MessageEvent) => {
            try {
                const data: ApprovedSummaryEvent = JSON.parse(event.data);
                setEvents(prev => [data, ...prev]);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse SSE event data', e);
            }
        });

        source.addEventListener('error', () => {
            setStatus('Connection error. SSE stream closed.');
            source.close();
        });

        return () => {
            source.close();
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">SSE Approved Summaries Live Test</h1>
                <p className="text-sm text-slate-600">Status: {status}</p>

                <div className="bg-white rounded-xl shadow border border-slate-200 p-4 max-h-[60vh] overflow-auto">
                    {events.length === 0 ? (
                        <p className="text-slate-500 text-sm">
                            No events yet. Approve an email group in the main UI to see live updates here.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {events.map((event, index) => (
                                <li
                                    key={`${event.emailGroupId}-${index}`}
                                    className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs text-slate-700"
                                >
                                    <div className="font-semibold mb-1">
                                        Email Group: <span className="text-slate-900">{event.emailGroupId}</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap break-all text-[11px] bg-white border border-slate-200 rounded p-2">
                                        {JSON.stringify(event.aiAnalysis, null, 2)}
                                    </pre>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}


