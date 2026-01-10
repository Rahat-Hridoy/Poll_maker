import { NextResponse } from 'next/server';
import { getPolls } from '@/lib/store';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('auth_session')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const polls = await getPolls(userId);
        return NextResponse.json(polls);
    } catch (error) {
        console.error('Error fetching polls:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
