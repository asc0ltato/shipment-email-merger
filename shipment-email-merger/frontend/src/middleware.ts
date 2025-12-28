import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionId = request.cookies.get('sessionId')?.value;
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboardPage && !sessionId) {
        console.log('Middleware: No session cookie, redirecting to login');
        return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Middleware: Session found, allowing access');
    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard/:path*',
};