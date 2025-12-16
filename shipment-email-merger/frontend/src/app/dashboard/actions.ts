'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const getBackendUrl = () => {
  return process.env.NODE_ENV === 'production' ? 'http://backend:3001' : 'http://localhost:3001';
};

export async function getDashboardData() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('sessionId')?.value;

        console.log('Server: Checking session cookie:', sessionId ? 'found' : 'not found');

        if (!sessionId) {
            console.log('Server: No session cookie, redirecting to login');
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
            console.log('Server: User API failed, clearing session and redirecting');
            redirect('/');
        }

        const userData = await userResponse.json();
        const emailGroupsData = await emailGroupsResponse.ok ? await emailGroupsResponse.json() : { data: { emailGroups: [] } };

        console.log('Server: Data loaded successfully');

        return {
            user: userData.data?.user,
            emailGroups: emailGroupsData.data?.emailGroups || [],
            emailStats: emailGroupsData.data?.emailStats || {}
        };
    } catch (error) {
        console.error('Server data loading error:', error);
        redirect('/');
    }
}