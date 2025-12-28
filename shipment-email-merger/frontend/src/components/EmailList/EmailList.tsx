'use client';

import { useState, useEffect, useMemo } from 'react';
import { IEmail } from '@/types/email.types';
import { EmailItem } from './EmailItem';

interface EmailListProps {
    emails: IEmail[];
    emailGroupId?: string;
    onDeleteEmailGroup?: () => void;
}

export function EmailList({ emails, emailGroupId, onDeleteEmailGroup }: EmailListProps) {
    const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
    const [localEmails, setLocalEmails] = useState<IEmail[]>([]);

    const sortedEmails = useMemo(() => {
        return [...emails].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [emails]);

    const handleEmailClick = (email: IEmail) => {
        setExpandedEmailId(expandedEmailId === email.id ? null : email.id);
    };

    const getEmailStats = () => {
        const total = sortedEmails.length;
        const newCount = sortedEmails.filter(email => email.status === 'not_processed').length;
        const processingCount = sortedEmails.filter(email => email.status === 'processing').length;
        const processedCount = sortedEmails.filter(email => email.status === 'processed').length;
        const failedCount = sortedEmails.filter(email => email.status === 'failed').length;

        return { total, new: newCount, processing: processingCount, processed: processedCount, failed: failedCount };
    };

    const stats = getEmailStats();

    useEffect(() => {
        setLocalEmails(sortedEmails);
    }, [sortedEmails]);

    const hasSelectedGroup = !!emailGroupId;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-slate-200/60 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Emails</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {hasSelectedGroup ? `${emailGroupId}` : 'Select an email group to view emails'}
                            </p>
                        </div>
                    </div>

                    {hasSelectedGroup && (
                        <div className="flex items-center gap-3">
                            <div className="flex gap-4 text-xs mr-4">
                                <div className="text-center">
                                    <div className="font-semibold text-gray-600">{stats.new}</div>
                                    <div className="text-slate-500">Not processed</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-600">{stats.processing}</div>
                                    <div className="text-slate-500">Processing</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-green-600">{stats.processed}</div>
                                    <div className="text-slate-500">Processed</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-orange-600">{stats.failed}</div>
                                    <div className="text-slate-500">Failed</div>
                                </div>
                            </div>

                            {onDeleteEmailGroup && (
                                <button
                                    onClick={onDeleteEmailGroup}
                                    className="group relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>

                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                        Delete group: {emailGroupId} and all associated emails
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {localEmails.length === 0 ? (
                    <div className="flex items-center justify-center flex-1 text-slate-500 p-8 min-h-0">
                        <div className="text-center space-y-3 -mt-8">
                            <div className="w-16 h-16 bg-slate-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                                {hasSelectedGroup ? 'No emails in this group' : 'No email group selected'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {hasSelectedGroup ? 'This email group is empty' : 'Choose an email group from the list to see all emails in this group'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gradient-to-br from-slate-50/30 via-white/10 to-slate-100/20">
                        <div className="space-y-3">
                            {localEmails.map((email) => (
                                <EmailItem
                                    key={email.id}
                                    email={email}
                                    isExpanded={expandedEmailId === email.id}
                                    onToggle={handleEmailClick}
                                    emailGroupId={emailGroupId}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {hasSelectedGroup && (
                <div className="p-3 border-t border-slate-200/60 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-normal">
                            Total: {localEmails.length} email{localEmails.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Click to expand email details
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}