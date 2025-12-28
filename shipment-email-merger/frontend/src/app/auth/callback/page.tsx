'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useSessionSync } from "@/hooks/useSessionSync";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Completing authorization...');
    const hasProcessed = useRef(false);

    const { syncSessionWithServer } = useSessionSync();

    useEffect(() => {
        if (hasProcessed.current) {
            console.log('Callback already processed, skipping...');
            return;
        }

        hasProcessed.current = true;

        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const state = searchParams.get('state');

            console.log('Starting OAuth callback processing...');

            setStatus('Getting authorization data...');

            let email = localStorage.getItem('userEmail');

            if (!email && state) {
                try {
                    email = atob(state);
                    console.log('Email decoded from state:', email);
                } catch (e) {
                    console.error('Error decoding email from state:', e);
                }
            }

            if (!email) {
                setStatus('Error: email not found');
                console.error('No email found for callback');
                setTimeout(() => router.push('/?error=no_email'), 2000);
                return;
            }

            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);

            if (error) {
                setStatus(`Authorization error: ${error}`);
                console.error('OAuth error:', error);
                setTimeout(() => router.push('/?error=auth_failed'), 2000);
                return;
            }

            if (!code) {
                setStatus('Error: authorization code not received');
                setTimeout(() => router.push('/?error=no_code'), 2000);
                return;
            }

            try {
                setStatus('Sending data to server...');
                console.log('Sending authorization code to backend...');

                const response = await authApi.authCallback(code, email, state);

                console.log('Full auth callback response:', response);

                if (response.success && response.data?.sessionId && response.data?.user) {
                    setStatus('Synchronizing session...');
                    console.log('Authentication successful, syncing session...');

                    localStorage.setItem('sessionId', response.data.sessionId);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('userEmail', response.data.user.email);
                    localStorage.setItem('sessionCreated', Date.now().toString());

                    const syncSuccess = await syncSessionWithServer(response.data.sessionId);

                    if (syncSuccess) {
                        setStatus('Authorization successful!');
                        console.log('Session synchronized successfully');

                        setTimeout(() => {
                            console.log('Redirecting to dashboard...');
                            router.push('/dashboard');
                        }, 1000);
                    } else {
                        setStatus('Error: Failed to sync session');
                        console.error('Session sync failed');
                        setTimeout(() => router.push('/?error=session_sync_failed'), 2000);
                    }

                } else {
                    const errorMessage = response.error || response.message || 'Authentication failed';
                    setStatus(`Error: ${errorMessage}`);
                    console.error('Login failed:', errorMessage);
                    setTimeout(() => router.push(`/?error=${encodeURIComponent(errorMessage)}`), 2000);
                }

            } catch (error: any) {
                setStatus('Connection error');
                console.error('Callback error:', error);
                setTimeout(() => router.push('/?error=callback_failed'), 2000);
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
                </div>
                <p className="text-lg font-medium text-slate-700 mb-2">{status}</p>
                <div className="flex justify-center space-x-1">
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}