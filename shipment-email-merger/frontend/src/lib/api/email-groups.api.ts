import {
    ApiResponse,
    EmailGroupListResponse,
    RefreshEmailGroupResponse,
    FindEmailsResponse,
    SyncEmailsResponse
} from '@/types/api.types';
import { IEmailGroup } from '@/types/email-group.types';
import { baseApi } from './base.api';
import { logger } from '@/utils/logger';

export const emailGroupsApi = {
    getAllEmailGroups: () => {
        return baseApi.get<ApiResponse<EmailGroupListResponse>>('/api/email/all-email-groups');
    },

    refreshEmailGroup: (emailGroupId: string) => {
        return baseApi.post<ApiResponse<RefreshEmailGroupResponse>>(
            '/api/email/refresh-email-group',
            { emailGroupId }
        );
    },

    syncEmails: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const endpoint = `/api/email/email-groups${params.toString() ? `?${params.toString()}` : ''}`;

        logger.log('Calling syncEmails with params:', {
            startDate: startDate || 'not provided (default: last 1 day)',
            endDate: endDate || 'not provided (default: today)'
        });

        return baseApi.post<ApiResponse<SyncEmailsResponse>>(endpoint);
    },

    generateAllSummaries: () => {
        return baseApi.post<ApiResponse<{
            processed: number;
            total: number;
        }>>('/api/email-groups/generate-all-summaries');
    },

    findEmailsByEmailGroupId: (emailGroupId: string) => {
        return baseApi.post<ApiResponse<FindEmailsResponse>>(
            '/api/email/find-by-email-group',
            { emailGroupId }
        );
    },
    
    deleteEmailGroup: (emailGroupId: string) => {
        return baseApi.delete<ApiResponse<{ deleted: boolean }>>(
            `/api/email-groups/${emailGroupId}`
        );
    },

    approveEmailGroup: (emailGroupId: string) => {
        return baseApi.put<ApiResponse<{ emailGroupId: string; status: string }>>(
            `/api/email-groups/${emailGroupId}/approve`
        );
    },

    rejectEmailGroup: (emailGroupId: string) => {
        return baseApi.put<ApiResponse<{ emailGroupId: string; status: string }>>(
            `/api/email-groups/${emailGroupId}/reject`
        );
    },

    regenerateEmailGroupAI: (emailGroupId: string) => {
        return baseApi.post<ApiResponse<IEmailGroup>>(
            `/api/email-groups/${emailGroupId}/regenerate-ai`
        );
    },

    deleteEmailGroupSummary: (emailGroupId: string) => {
        return baseApi.delete<ApiResponse<IEmailGroup>>(
            `/api/email-groups/${emailGroupId}/summary`
        );
    },
};