import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import { useState } from 'react';
import { emailGroupsApi } from '@/lib/api';
import { IEmailGroup } from "@/types";

type SortOption = 'date-desc' | 'date-asc' | 'id-asc' | 'id-desc';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'failed';

interface EmailGroupFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (value: StatusFilter) => void;
    sortOption: SortOption;
    onSortOptionChange: (value: SortOption) => void;
    onGroupUpdated?: (emailGroupId: string, updatedGroup: IEmailGroup, isNewGroup: boolean) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'failed', label: 'Failed' }
];

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-desc', label: 'Newest first' },
    { value: 'date-asc', label: 'Oldest first' },
    { value: 'id-asc', label: '1-9' },
    { value: 'id-desc', label: '9-1' }
];

const tooltips = {
    status: {
        title: "Filter by status",
        content: "Show email groups based on their current status: pending, approved, rejected, or failed"
    },
    sort: {
        title: "Sort options",
        content: "Organize email groups by date (newest/oldest) or by ID (numerical order)"
    },
    search: {
        title: "Search email groups",
        content: "Find specific email groups by entering their unique email-group ID"
    },
    groupSearch: {
        title: "Find emails for email group",
        content: "Search and group emails for a specific email group ID"
    }
};

export function EmailGroupFilters({
                                      searchTerm,
                                      onSearchChange,
                                      statusFilter,
                                      onStatusFilterChange,
                                      sortOption,
                                      onSortOptionChange,
                                      onGroupUpdated
                                  }: EmailGroupFiltersProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [hoveredSelect, setHoveredSelect] = useState<string | null>(null);
    const [groupSearchId, setGroupSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchMessage, setSearchMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleGroupSearch = async () => {
        if (!groupSearchId.trim()) {
            setSearchMessage({ text: 'Please enter an email group ID', type: 'error' });
            return;
        }

        setIsSearching(true);
        setSearchMessage(null);

        try {
            const result = await emailGroupsApi.findEmailsByEmailGroupId(groupSearchId.trim());

            if (result.success && result.data?.emailGroup) {
                const emailCount = result.data.emailCount || 0;
                const created = result.data.created || false;
                const isNewGroup = result.data.isNewGroup || false;

                console.log('Find search successful:', {
                    emailCount,
                    created,
                    isNewGroup,
                    hasEmailGroup: !!result.data.emailGroup
                });

                if (onGroupUpdated) {
                    onGroupUpdated(groupSearchId.trim(), result.data.emailGroup, isNewGroup);
                }

                setSearchMessage({
                    text: `Found ${emailCount} emails and ${created ? 'created' : 'updated'} email group ${groupSearchId}`,
                    type: 'success'
                });

                setGroupSearchId('');
                setTimeout(() => setSearchMessage(null), 3000);
            } else {
                console.log('Find search failed:', result.message);
                setSearchMessage({ text: result.message || 'Failed to find emails', type: 'error' });
            }
        } catch (error: any) {
            console.log('Find search error:', error);
            setSearchMessage({ text: error.message || 'Error searching emails', type: 'error' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleGroupSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleGroupSearch();
    };

    return (
        <div className="p-4 space-y-4 ">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-slate-700">Find emails for email group</label>
                    <div
                        className="relative"
                        onMouseEnter={() => setActiveTooltip('groupSearch')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <button className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>

                        {activeTooltip === 'groupSearch' && (
                            <div className="absolute z-50 top-full left-0 mt-2 w-72 p-4 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-800 text-sm">
                                        {tooltips.groupSearch.title}
                                    </h4>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        {tooltips.groupSearch.content}
                                    </p>
                                </div>
                                <div className="absolute -top-1 left-3 w-2 h-2 bg-white border-l border-t border-slate-200/60 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter email group ID"
                            value={groupSearchId}
                            onChange={(e) => setGroupSearchId(e.target.value)}
                            onKeyPress={handleGroupSearchKeyPress}
                            disabled={isSearching}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 font-medium"
                        />
                    </div>
                    <button
                        onClick={handleGroupSearch}
                        disabled={isSearching || !groupSearchId.trim()}
                        className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        )}
                        {isSearching ? 'Searching...' : 'Find'}
                    </button>
                </div>

                {searchMessage && (
                    <div className={`text-xs p-2 rounded ${
                        searchMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {searchMessage.text}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-slate-700">Search email groups</label>
                    <div
                        className="relative"
                        onMouseEnter={() => setActiveTooltip('search')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <button className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>

                        {activeTooltip === 'search' && (
                            <div className="absolute z-50 top-full left-0 mt-2 w-64 p-4 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-800 text-sm">
                                        {tooltips.search.title}
                                    </h4>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        {tooltips.search.content}
                                    </p>
                                </div>
                                <div className="absolute -top-1 left-3 w-2 h-2 bg-white border-l border-t border-slate-200/60 transform rotate-45"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Enter email group ID (e.g., 123456)"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-slate-700">Status</label>
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveTooltip('status')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <button className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>

                            {activeTooltip === 'status' && (
                                <div className="absolute z-50 top-full left-0 mt-2 w-72 p-4 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800 text-sm">
                                            {tooltips.status.title}
                                        </h4>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            {tooltips.status.content}
                                        </p>
                                        <div className="space-y-2 pt-2 border-t border-slate-200/40">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                <span className="font-medium text-slate-700">Pending:</span>
                                                <span className="text-slate-600">Awaiting review or action</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="font-medium text-slate-700">Approved:</span>
                                                <span className="text-slate-600">Successfully processed</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className="font-medium text-slate-700">Rejected:</span>
                                                <span className="text-slate-600">Requires attention or correction</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                <span className="font-medium text-slate-700">Failed:</span>
                                                <span className="text-slate-600">AI analysis could not extract useful information</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 left-3 w-2 h-2 bg-white border-l border-t border-slate-200/60 transform rotate-45"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        onMouseEnter={() => setHoveredSelect('status')}
                        onMouseLeave={() => setHoveredSelect(null)}
                    >
                        <CustomSelect<StatusFilter>
                            value={statusFilter}
                            onChange={onStatusFilterChange}
                            options={statusOptions}
                            forceOpen={hoveredSelect === 'status'}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-slate-700">Sort by</label>
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveTooltip('sort')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <button className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>

                            {activeTooltip === 'sort' && (
                                <div className="absolute z-50 top-full left-0 mt-2 w-64 p-4 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800 text-sm">
                                            {tooltips.sort.title}
                                        </h4>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            {tooltips.sort.content}
                                        </p>
                                        <div className="space-y-2 pt-2 border-t border-slate-200/40">
                                            <div className="flex items-center gap-2 text-xs">
                                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                                <span className="font-medium text-slate-700">Newest first:</span>
                                                <span className="text-slate-600">Recent updates first</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                                </svg>
                                                <span className="font-medium text-slate-700">Oldest first:</span>
                                                <span className="text-slate-600">Older updates first</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                                                </svg>
                                                <span className="font-medium text-slate-700">ID 1-9 / 9-1:</span>
                                                <span className="text-slate-600">Numerical order</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 left-3 w-2 h-2 bg-white border-l border-t border-slate-200/60 transform rotate-45"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        onMouseEnter={() => setHoveredSelect('sort')}
                        onMouseLeave={() => setHoveredSelect(null)}
                    >
                        <CustomSelect<SortOption>
                            value={sortOption}
                            onChange={onSortOptionChange}
                            options={sortOptions}
                            forceOpen={hoveredSelect === 'sort'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}