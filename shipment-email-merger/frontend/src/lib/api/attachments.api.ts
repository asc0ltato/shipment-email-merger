import { baseApi } from './base.api';
import { logger } from '@/utils/logger';

export const attachmentsApi = {
    downloadAttachment: async (emailGroupId: string, filename: string): Promise<Blob> => {
        const sessionId = localStorage.getItem('sessionId');
        const headers: HeadersInit = {};

        if (sessionId) {
            headers['Authorization'] = `Bearer ${sessionId}`;
        }

        const encodedFilename = encodeURIComponent(filename);

        const response = await baseApi.rawRequest(
            `/api/email-groups/${emailGroupId}/attachment/${encodedFilename}`,
            { headers }
        );

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`Download error ${response.status}:`, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        return response.blob();
    }
};