'use server'

import { revalidatePath } from 'next/cache';
import { Poll, QuestionType } from '@/lib/data';
import { getPoll, getPolls, savePoll, deletePollFromStore, incrementPollVisitors, getPollByCode } from '@/lib/store';
import { cookies } from 'next/headers';
import Papa from 'papaparse';

function generateShortCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function importPolls(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: "No file uploaded" };
    }

    try {
        const text = await file.text();
        const { data, errors } = Papa.parse(text, { header: false, skipEmptyLines: true });

        if (errors.length > 0) {
            console.error("CSV Parse Errors:", errors);
            return { success: false, error: "Failed to parse CSV" };
        }

        const cookieStore = await cookies();
        const creatorId = cookieStore.get('auth_session')?.value;

        if (!creatorId) {
            return { success: false, error: "Unauthorized" };
        }

        // Group rows by Poll Title to handle multiple questions/polls
        // CSV Format: Title, Description, Type, Question, Option1, Option2...
        const pollsMap = new Map<string, Poll>();

        // Type assertion for the row array
        const rows = data as string[][];

        rows.forEach((row, index) => {
            // Skip header row if it exists and matches expected structure (or just skip first row if it looks like header)
            // Heuristic: Check if first cell is 'Poll Title'
            if (index === 0 && row[0]?.toLowerCase().includes('title')) return;

            if (row.length < 4) return; // invalid row

            // New Order: Title(0), Desc(1), Question(2), Type(3), Options(4...)
            const [title, description, questionText, type, ...options] = row;
            const validOptions = options.filter(o => o && o.trim() !== '');

            let poll = pollsMap.get(title);
            if (!poll) {
                poll = {
                    id: `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    shortCode: generateShortCode(),
                    title,
                    description,
                    status: 'published', // Import as published by default for immediate visibility
                    createdAt: new Date().toISOString(),
                    visitors: 0,
                    totalVotes: 0,
                    questions: [],
                    creatorId
                };
                pollsMap.set(title, poll);
            }

            let qType: QuestionType = 'single';
            // Map common type strings to internal types
            const lowerType = type?.toLowerCase().trim();
            if (lowerType === 'multiple-choice' || lowerType === 'multiple') qType = 'multiple';
            else if (lowerType === 'text') qType = 'text';

            poll.questions.push({
                id: `q-${Date.now()}-${Math.random()}`,
                text: questionText,
                type: qType,
                options: validOptions.map(opt => ({
                    id: `opt-${Date.now()}-${Math.random()}`,
                    text: opt,
                    votes: 0
                }))
            });
        });

        for (const poll of pollsMap.values()) {
            await savePoll(poll);
        }

        revalidatePath('/admin/dashboard');
        return { success: true, count: pollsMap.size };
    } catch (e) {
        console.error("Import error:", e);
        return { success: false, error: "Failed to process import" };
    }
}

export async function createPoll(formData: any) {
    const { title, description, questions, status = 'published', id, scheduledAt, style, settings } = formData;
    const cookieStore = await cookies();
    const creatorId = cookieStore.get('auth_session')?.value;

    let existingPoll: Poll | undefined;
    if (id) {
        existingPoll = await getPoll(id);
    }

    const newPoll: Poll = {
        id: id || `poll-${Date.now()}`,
        shortCode: existingPoll?.shortCode || generateShortCode(),
        title,
        description,
        status,
        scheduledAt,
        style,
        settings,
        createdAt: existingPoll?.createdAt || new Date().toISOString(),
        visitors: existingPoll?.visitors || 0,
        totalVotes: existingPoll?.totalVotes || 0,
        questions: questions.map((q: any) => ({
            id: q.id || `q-${Date.now()}-${Math.random()}`,
            text: q.text,
            type: q.type,
            options: q.options.map((o: any) => ({
                id: o.id || `opt-${Date.now()}-${Math.random()}`,
                text: o.text,
                votes: o.votes || 0
            }))
        })),
        creatorId: creatorId || existingPoll?.creatorId // Attach the logged-in user ID
    };

    await savePoll(newPoll);
    revalidatePath('/admin/dashboard');
    return { success: true, pollId: newPoll.id };
}

export async function submitVote(pollId: string, answers: Record<string, string | string[]>, voterInfo: { name: string, email: string }) {
    const poll = await getPoll(pollId);
    if (!poll) return { success: false, error: "Poll not found" };

    // Check revote prevention (if allowEditVote is false)
    if (poll.settings && !poll.settings.allowEditVote) {
        const pollWithClients = poll as Poll & { clients?: any[] };
        const hasVoted = pollWithClients.clients?.some(c => c.email === voterInfo.email);
        if (hasVoted) {
            return { success: false, error: "You have already voted in this poll." };
        }
    }

    // Update votes (support both single and multiple choice)
    poll.questions.forEach(q => {
        const answerVal = answers[q.id];

        if (Array.isArray(answerVal)) {
            // Multiple choice - increment each selected option
            answerVal.forEach(aId => {
                const option = q.options.find(o => o.id === aId);
                if (option) option.votes += 1;
            });
        } else if (answerVal) {
            // Single choice - increment one option
            const option = q.options.find(o => o.id === answerVal);
            if (option) option.votes += 1;
        }
    });

    poll.totalVotes += 1;

    // Track voter in clients array
    const pollWithClients = poll as Poll & { clients?: any[] };
    if (!pollWithClients.clients) pollWithClients.clients = [];

    pollWithClients.clients.push({
        name: voterInfo.name,
        email: voterInfo.email,
        time: new Date().toISOString()
    });

    await savePoll(poll);
    revalidatePath(`/admin/${pollId}/stats`);
    revalidatePath(`/poll/${pollId}`);
    revalidatePath(`/admin/dashboard`);

    return { success: true };
}

export async function trackPollVisitor(pollId: string) {
    try {
        await incrementPollVisitors(pollId);
        revalidatePath('/admin/dashboard');
        revalidatePath(`/admin/${pollId}/stats`);
        return { success: true };
    } catch (e) {
        console.error("Error tracking visitor:", e);
        return { success: false };
    }
}

export async function deletePoll(id: string) {
    try {
        await deletePollFromStore(id);
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting poll:", error);
        return { success: false, error: "Failed to delete poll" };
    }
}

export async function updatePollStatus(id: string, status: 'published' | 'draft' | 'scheduled', scheduledAt?: string) {
    const poll = await getPoll(id);
    if (!poll) return { success: false, error: "Poll not found" };

    poll.status = status;
    if (scheduledAt) poll.scheduledAt = scheduledAt;

    await savePoll(poll);
    revalidatePath('/admin/dashboard');
    revalidatePath(`/poll/${id}`);
    return { success: true };
}

export async function findPollByCode(code: string) {
    const poll = await getPollByCode(code);
    if (!poll) return { success: false, error: "Poll not found" };
    return { success: true, pollId: poll.id };
}
