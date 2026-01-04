import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/store';
import { cookies } from 'next/headers';
import { User } from '@/lib/data';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            password // In production, hash this!
        };

        await createUser(newUser);

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_session', newUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
