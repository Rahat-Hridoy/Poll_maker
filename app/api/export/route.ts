import { type NextRequest, NextResponse } from 'next/server';
import { getPolls } from '@/lib/store';
import { cookies } from 'next/headers';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_session')?.value;

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let pollIds: string[] = [];
    try {
        const body = await request.json();
        pollIds = body.pollIds || [];
    } catch (e) {
        // If body parsing fails or is empty, pollIds remains []
    }

    const allPolls = await getPolls(userId);

    // Filter polls if IDs are provided
    const pollsToExport = pollIds.length > 0
        ? allPolls.filter(p => pollIds.includes(p.id))
        : allPolls;

    if (pollsToExport.length === 0) {
        return new NextResponse("No polls found to export", { status: 404 });
    }

    // Flatten data for Detailed CSV (Import Format)
    // Structure: Poll Title, Description, Question Text, Answer Type, Options
    const csvRows: string[][] = [];

    // Add Header Row
    csvRows.push(['Poll Title', 'Description', 'Question Text', 'Answer Type', 'Options']);

    pollsToExport.forEach(poll => {
        poll.questions.forEach(q => {
            const row = [
                poll.title,
                poll.description || '',
                q.text,
                q.type,
                ...q.options.map(o => o.text)
            ];
            csvRows.push(row);
        });
    });

    const csv = Papa.unparse(csvRows);

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="polls_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
    });
}
