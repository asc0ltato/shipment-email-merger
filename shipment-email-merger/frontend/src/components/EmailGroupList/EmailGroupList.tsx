'use client';

import { IEmailGroup } from '@/types';
import { useState, useMemo, useCallback } from 'react';
import { EmailGroupFilters } from './EmailGroupFilters';
import { EmailGroupItem } from './EmailGroupItem';

type SortOption = 'date-desc' | 'date-asc' | 'id-asc' | 'id-desc';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'failed';

interface EmailGroupListProps {
    emailGroups: IEmailGroup[];
    onEmailGroupSelect: (emailGroupId: string) => Promise<void>;
    selectedEmailGroupId: string | null;
    onEmailGroupRefresh?: (emailGroupId: string, updatedGroup: IEmailGroup, isNewGroup: boolean) => void;
    onGroupUpdated?: (emailGroupId: string, updatedGroup: IEmailGroup, isNewGroup: boolean) => void;
}

export function EmailGroupList({
                                   emailGroups,
                                   onEmailGroupSelect,
                                   selectedEmailGroupId,
                                   onEmailGroupRefresh,
                                   onGroupUpdated
                               }: EmailGroupListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const [clickInProgress, setClickInProgress] = useState<string | null>(null);

    const getEmailGroupStatus = useCallback((emailGroup: IEmailGroup): string => {
        if (emailGroup.summary && emailGroup.summary.status) {
            return emailGroup.summary.status;
        }

        if (emailGroup.summaries && emailGroup.summaries.length > 0) {
            const pendingSummary = emailGroup.summaries.find(s => 
                s.status === 'pending' || s.status === 'processing'
            );
            if (pendingSummary) {
                return pendingSummary.status;
            }

            const approvedRejectedSummary = emailGroup.summaries.find(s => 
                s.status === 'approved' || s.status === 'rejected'
            );
            if (approvedRejectedSummary) {
                return approvedRejectedSummary.status;
            }

            const failedSummary = emailGroup.summaries.find(s => s.status === 'failed');
            if (failedSummary) {
                return 'failed';
            }
        }

        return 'not-processed';
    }, []);

    const filteredAndSortedEmailGroups = useMemo(() => {
        let result = [...emailGroups];

        if (searchTerm) {
            result = result.filter(s => 
                s.emailGroupId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(s => {
                const groupStatus = getEmailGroupStatus(s);
                return groupStatus === statusFilter;
            });
        }

        switch (sortOption) {
            case 'date-desc':
                result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                break;
            case 'date-asc':
                result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
                break;
            case 'id-asc':
                result.sort((a, b) => {
                    const numA = parseInt(a.emailGroupId.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.emailGroupId.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });
                break;
            case 'id-desc':
                result.sort((a, b) => {
                    const numA = parseInt(a.emailGroupId.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.emailGroupId.replace(/\D/g, '')) || 0;
                    return numB - numA;
                });
                break;
        }

        console.log('Filtered email groups:', {
            total: emailGroups.length,
            filtered: result.length,
            statusFilter,
            searchTerm,
            statusCounts: {
                pending: emailGroups.filter(g => getEmailGroupStatus(g) === 'pending').length,
                approved: emailGroups.filter(g => getEmailGroupStatus(g) === 'approved').length,
                rejected: emailGroups.filter(g => getEmailGroupStatus(g) === 'rejected').length,
                failed: emailGroups.filter(g => getEmailGroupStatus(g) === 'failed').length,
                'not-processed': emailGroups.filter(g => getEmailGroupStatus(g) === 'not-processed').length
            }
        });

        return result;
    }, [emailGroups, searchTerm, statusFilter, sortOption, getEmailGroupStatus]);

    const handleEmailGroupClick = useCallback(async (emailGroupId: string) => {
        if (clickInProgress) {
            console.log('Another click already in progress, skipping...');
            return;
        }

        setClickInProgress(emailGroupId);

        try {
            await onEmailGroupSelect(emailGroupId);
        } catch (error) {
            console.error('Error in email group click:', error);
        } finally {
            setTimeout(() => {
                setClickInProgress(null);
            }, 500);
        }
    }, [onEmailGroupSelect, clickInProgress]);

    const showBottomBlock = filteredAndSortedEmailGroups.length > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col relative">
            <div className="relative z-10">
                <EmailGroupFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortOption={sortOption}
                    onSortOptionChange={setSortOption}
                    onGroupUpdated={onGroupUpdated}
                />
            </div>

            <div className={`flex-1 ${showBottomBlock ? 'overflow-y-auto' : ''} min-h-0 p-4 relative z-0`}>
                {filteredAndSortedEmailGroups.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 h-full flex flex-col items-center justify-center -mt-5">
                        <div className="relative mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 flex items-center justify-center rounded-xl shadow-sm">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-600">No email groups found</p>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAndSortedEmailGroups.map(emailGroup => (
                            <EmailGroupItem
                                key={emailGroup.emailGroupId}
                                emailGroup={emailGroup}
                                isSelected={selectedEmailGroupId === emailGroup.emailGroupId}
                                isRefreshing={clickInProgress === emailGroup.emailGroupId}
                                onClick={() => handleEmailGroupClick(emailGroup.emailGroupId)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showBottomBlock && (
                <div className="p-3 border-t border-slate-200/60 bg-slate-50/50 flex-shrink-0">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>
                            Showing {filteredAndSortedEmailGroups.length} of {emailGroups.length} groups
                        </span>
                        {(statusFilter !== 'all' || searchTerm) && (
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                                </svg>
                                Filtered
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}