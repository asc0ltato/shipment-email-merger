'use client';

import { useEffect } from 'react';

export interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500/90 border-green-600';
            case 'error':
                return 'bg-red-500/90 border-red-600';
            case 'info':
                return 'bg-blue-500/90 border-blue-600';
            default:
                return 'bg-slate-500/90 border-slate-600';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-50 max-w-sm transition-all duration-300 backdrop-blur-sm border ${getBackgroundColor()} text-white`}>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <span className="text-sm font-medium flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-white hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                >
                    ×
                </button>
            </div>
        </div>
    );
}