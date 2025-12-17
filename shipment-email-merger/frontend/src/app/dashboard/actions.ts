'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logger } from '@/utils/logger';

const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3001';
  return url.replace(/\/+$/, '');
};

export async function getDashboardData() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('sessionId')?.value;

        logger.debug('Server: Checking session cookie:', sessionId ? 'found' : 'not found');

        if (!sessionId) {
            logger.debug('Server: No session cookie, redirecting to login');
            redirect('/');
        }

        const backendUrl = getBackendUrl();
        
        const [userResponse, emailGroupsResponse] = await Promise.all([
            fetch(`${backendUrl}/api/oauth/user`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            }),
            fetch(`${backendUrl}/api/email/all-email-groups`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            })
        ]);

        if (!userResponse.ok) {
            logger.debug('Server: User API failed, clearing session and redirecting');
            redirect('/');
        }

        const userData = await userResponse.json();
        const emailGroupsData = await emailGroupsResponse.ok ? await emailGroupsResponse.json() : { data: { emailGroups: [] } };

        logger.debug('Server: Data loaded successfully');

        return {
            user: userData.data?.user,
            emailGroups: emailGroupsData.data?.emailGroups || [],
            emailStats: emailGroupsData.data?.emailStats || {}
        };
    } catch (error) {
        logger.error('Server data loading error:', error);
        redirect('/');
    }
}