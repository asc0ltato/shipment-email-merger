import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json();

        // console.log('Syncing session with server:', sessionId ? 'session found' : 'no session');

        if (sessionId) {
            const cookieStore = await cookies();
            cookieStore.set('sessionId', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });

            // console.log('Session cookie set successfully');
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'No session ID provided' }, { status: 400 });
    } catch (error) {
        console.error('Failed to sync session:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}