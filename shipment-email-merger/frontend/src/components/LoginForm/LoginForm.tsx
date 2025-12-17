'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { ProviderIcon } from './ProviderIcon';
import { logger } from '@/utils/logger';

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const searchParams = useSearchParams();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(getErrorMessage(errorParam));
            window.history.replaceState({}, '', '/');
        }
    }, [searchParams]);

    const getErrorMessage = (errorCode: string): string => {
        const errors: { [key: string]: string } = {
            'auth_failed': 'Authentication error',
            'no_code': 'Authorization code not received',
            'callback_failed': 'Error completing authorization',
            'response_too_large': 'Data volume too large',
            'no_email': 'Email not found',
            'default': 'Login error occurred',
        };
        return errors[errorCode] || errors['default'];
    };

    const getProviderInstructions = (email: string): string => {
        const domain = email.split('@')[1]?.toLowerCase();

        if (domain?.includes('gmail.com')) {
            return 'You will be asked to grant access to Gmail to search for order-related emails';
        }

        if (domain?.includes('mail.ru')) {
            return 'You will be asked to grant access to Mail.ru mailbox to search for order-related emails';
        }

        return '';
    };

    const getProviderName = (email: string): string => {
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain?.includes('mail.ru')) return 'Mail.ru';
        if (domain?.includes('gmail.com')) return 'Google';
        return 'email service';
    };

    const handleOAuthLogin = async () => {
        if (!email) {
            setError('Please enter email address');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            logger.log(`Starting OAuth for: ${email}`);

            localStorage.setItem('userEmail', email);

            const response = await authApi.getAuthUrl(email);

            logger.log('Full API response:', response);

            if (response.success && response.data?.authUrl) {
                logger.log(`Auth URL received: ${response.data.authUrl}`);
                window.location.href = response.data.authUrl;
            } else {
                const errorMessage = response.message || 'Failed to get authorization URL';
                logger.error('Auth URL error:', errorMessage);
                setError(`Authorization failed: ${errorMessage}`);
                localStorage.removeItem('userEmail');
            }
        } catch (error: any) {
            logger.error('OAuth error:', error);
            setError(error.message || 'Server connection error');
            localStorage.removeItem('userEmail');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-8">
                <div className="text-center space-y-4">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m0 0l8-4m-8 4V7"></path>
                            </svg>
                        </div>
                        <div className="absolute -inset-2 border-2 border-slate-300/50 rounded-2xl animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Order Tracker
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">
                            Track your shipments
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-700 backdrop-blur-sm"
                        />
                    </div>

                    {email && getProviderInstructions(email) && (
                        <div className="bg-slate-100/80 border border-slate-300 rounded-xl p-4 text-sm text-slate-700 backdrop-blur-sm">
                            <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>{getProviderInstructions(email)}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleOAuthLogin}
                        disabled={isLoading || !email}
                        className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                <span className="font-medium">Connecting...</span>
                            </>
                        ) : (
                            <>
                                <ProviderIcon email={email} />
                                <span className="font-medium">
                                    Sign in with {email ? getProviderName(email) : 'email service'}
                                </span>
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center pt-4 border-t border-slate-200/60">
                    <p className="text-sm text-slate-500 font-medium">
                        Supported services:{' '}
                        <span className="text-slate-700">Gmail</span> and{' '}
                        <span className="text-slate-700">Mail.ru</span>
                    </p>
                </div>
            </div>
        </div>
    );
}