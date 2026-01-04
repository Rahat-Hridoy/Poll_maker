import { NextRequest, NextResponse } from 'next/server';
import { getPoll } from '@/lib/store';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const poll = await getPoll(id);

        if (!poll) {
            return NextResponse.json(
                { error: 'Poll not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(poll);
    } catch (error) {
        console.error('Error fetching poll:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
