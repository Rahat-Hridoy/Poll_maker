import fs from 'fs';
import path from 'path';
import { Poll, MOCK_POLLS } from './data';

const DB_PATH = path.join(process.cwd(), 'data.json');

// Global in-memory store fallback for Vercel/Serverless where filesystem is read-only
let memoryPolls: Poll[] = [];

// Initialize memoryPolls with MOCK_POLLS or from file if possible
function initStore() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const fileData = fs.readFileSync(DB_PATH, 'utf-8');
            const data = JSON.parse(fileData);
            memoryPolls = data.polls || [...MOCK_POLLS];
        } else {
            memoryPolls = [...MOCK_POLLS];
            // Try to write initial data to file (works locally, fails on Vercel)
            try {
                fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls }, null, 2));
            } catch (e) {
                console.warn("Could not write initial data.json, using in-memory store.");
            }
        }
    } catch (error) {
        console.error("Error initializing store:", error);
        memoryPolls = [...MOCK_POLLS];
    }
}

// Run init
initStore();

export function getPolls(): Poll[] {
    // On Serverless, we should probably re-read from memory or a real DB.
    // Since this is a demo, we use the global variable.
    return memoryPolls;
}

export function savePoll(poll: Poll) {
    const existingIndex = memoryPolls.findIndex(p => p.id === poll.id);

    if (existingIndex >= 0) {
        memoryPolls[existingIndex] = poll;
    } else {
        memoryPolls.push(poll);
    }

    // Attempt to persist to file (works locally)
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls }, null, 2));
    } catch (error) {
        // Log once or silently fail for Vercel
        console.warn("Filesystem is read-only. Data will be ephemeral.");
    }
}

export function getPoll(id: string): Poll | undefined {
    return memoryPolls.find(p => p.id === id);
}
