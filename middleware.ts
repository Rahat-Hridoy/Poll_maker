import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('auth_session')
    const { pathname } = request.nextUrl

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect authenticated users away from login/signup
    if ((pathname === '/login' || pathname === '/signup') && session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/signup'],
}
