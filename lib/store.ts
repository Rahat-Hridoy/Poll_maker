import fs from 'fs';
import path from 'path';
import { Poll } from './data';

const DB_PATH = path.join(process.cwd(), 'data.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    // Initial Seed
    const initialData: { polls: Poll[] } = {
        polls: [
            {
                id: "poll-1",
                title: "Best Programming Language 2024",
                description: "Help us decide which language rules them all.",
                status: 'published',
                createdAt: new Date().toISOString(),
                visitors: 1240,
                totalVotes: 856,
                questions: [
                    {
                        id: "q-1",
                        text: "What is your primary language?",
                        type: "single",
                        options: [
                            { id: "opt-1", text: "TypeScript", votes: 450 },
                            { id: "opt-2", text: "Python", votes: 300 },
                            { id: "opt-3", text: "Rust", votes: 106 }
                        ]
                    }
                ]
            }
        ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

export function getPolls(): Poll[] {
    try {
        const fileData = fs.readFileSync(DB_PATH, 'utf-8');
        const data = JSON.parse(fileData);
        return data.polls || [];
    } catch (error) {
        console.error("Error reading DB:", error);
        return [];
    }
}

export function savePoll(poll: Poll) {
    const polls = getPolls();
    const existingIndex = polls.findIndex(p => p.id === poll.id);

    if (existingIndex >= 0) {
        polls[existingIndex] = poll;
    } else {
        polls.push(poll);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify({ polls }, null, 2));
}

export function getPoll(id: string): Poll | undefined {
    const polls = getPolls();
    return polls.find(p => p.id === id);
}
