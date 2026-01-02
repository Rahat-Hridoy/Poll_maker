'use server'

import { revalidatePath } from 'next/cache';
import { Poll } from '@/lib/data';
import { getPoll, getPolls, savePoll } from '@/lib/store';

export async function createPoll(formData: any) {
    const { title, description, questions } = formData;

    // Convert generic questions to typed PollQuestion structure if needed
    // For now assuming the incoming data matches roughly what we need usually, 
    // but likely we need to shape it properly.

    const newPoll: Poll = {
        id: `poll-${Date.now()}`,
        title,
        description,
        status: 'published',
        createdAt: new Date().toISOString(),
        visitors: 0,
        totalVotes: 0,
        questions: questions.map((q: any) => ({
            id: `q-${Date.now()}-${Math.random()}`,
            text: q.text,
            type: q.type,
            options: q.options.map((o: any) => ({
                id: `opt-${Date.now()}-${Math.random()}`,
                text: o.text,
                votes: 0
            }))
        }))
    };

    savePoll(newPoll);
    revalidatePath('/admin/dashboard');
    return { success: true, pollId: newPoll.id };
}

export async function submitVote(pollId: string, answers: Record<string, string>, voterInfo: { name: string, email: string }) {
    const poll = getPoll(pollId);
    if (!poll) return { success: false, error: "Poll not found" };

    // Update votes
    // Note: This naive implementation has race conditions but is fine for a demo.
    poll.questions.forEach(q => {
        const answerId = answers[q.id];
        if (answerId) {
            const option = q.options.find(o => o.id === answerId);
            if (option) {
                option.votes += 1;
            }
        }
    });

    poll.totalVotes += 1;
    // We optionally could store the voter info in a separate "votes" collection, 
    // but for now we won't persist the list of voters in our simple JSON store 
    // unless we update the Type definition.
    // Let's assume we just track the counts for the standard view, 
    // and maybe log the visitor for the "Client List" requirement if we extend the type.

    // For the "Client List" requirement from the User, we'll need to store it.
    // Let's add a "clients" array to the Poll object via type assertion for now.

    const pollWithClients = poll as Poll & { clients?: any[] };
    if (!pollWithClients.clients) pollWithClients.clients = [];

    pollWithClients.clients.push({
        name: voterInfo.name,
        email: voterInfo.email,
        time: new Date().toISOString() // "just now" equivalent
    });

    savePoll(poll);
    revalidatePath(`/admin/${pollId}/stats`);
    revalidatePath(`/poll/${pollId}`);

    return { success: true };
}
