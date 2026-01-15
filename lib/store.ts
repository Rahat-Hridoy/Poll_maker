import fs from 'fs';
import path from 'path';
import { Poll, MOCK_POLLS, User, Presentation, MOCK_PRESENTATIONS } from './data';
import { sql } from '@vercel/postgres';

const DB_PATH = path.join(process.cwd(), 'data.json');
const IS_VERCEL = !!process.env.VERCEL;

// Global in-memory store fallback
let memoryPolls: Poll[] = [];
let memoryUsers: User[] = [];
let memoryPresentations: Presentation[] = [];
let lastFileReadTime: number = 0;

// Initialize memoryPolls with MOCK_POLLS or from file if possible (for local dev)
function initLocalStore() {
    try {
        if (!IS_VERCEL && fs.existsSync(DB_PATH)) {
            const fileData = fs.readFileSync(DB_PATH, 'utf-8');
            const data = JSON.parse(fileData);
            memoryPolls = data.polls || [...MOCK_POLLS];
            memoryUsers = data.users || [];
            memoryPresentations = data.presentations || [...MOCK_PRESENTATIONS];
            lastFileReadTime = Date.now();
        } else {
            memoryPolls = [...MOCK_POLLS];
            memoryUsers = [];
            memoryPresentations = [...MOCK_PRESENTATIONS];
            try {
                if (!IS_VERCEL) {
                    fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls, users: memoryUsers, presentations: memoryPresentations }, null, 2));
                }
                lastFileReadTime = Date.now();
            } catch { }
        }
    } catch {
        memoryPolls = [...MOCK_POLLS];
        memoryUsers = [];
        memoryPresentations = [...MOCK_PRESENTATIONS];
    }
}

initLocalStore();

function reloadIfNeeded() {
    if (process.env.POSTGRES_URL) return; // DB mode doesn't need file reload

    try {
        if (!IS_VERCEL && fs.existsSync(DB_PATH)) {
            const stats = fs.statSync(DB_PATH);
            const fileModTime = stats.mtimeMs;

            if (fileModTime > lastFileReadTime) {
                const fileData = fs.readFileSync(DB_PATH, 'utf-8');
                const data = JSON.parse(fileData);
                memoryPolls = data.polls || [...MOCK_POLLS];
                memoryUsers = data.users || [];
                memoryPresentations = data.presentations || [...MOCK_PRESENTATIONS];
                lastFileReadTime = Date.now();
            }
        }
    } catch (error) {
        console.error("Error reloading from file:", error);
    }
}

async function ensureTable() {
    if (process.env.POSTGRES_URL) {
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS polls (
                    id TEXT PRIMARY KEY,
                    data JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `;
        } catch (e) {
            console.error("Failed to ensure table exists:", e);
        }
    }
}

// User Management
export async function createUser(user: User): Promise<void> {
    reloadIfNeeded();
    memoryUsers.push(user);
    saveData();
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    reloadIfNeeded();
    return memoryUsers.find(u => u.email === email);
}

function saveData() {
    if (!IS_VERCEL) {
        try {

            fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls, users: memoryUsers, presentations: memoryPresentations }, null, 2));
            lastFileReadTime = Date.now();
        } catch (e) {
            console.error("[Store] Failed to write to data.json:", e);
        }
    }
}

export async function getPolls(creatorId?: string): Promise<Poll[]> {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            const { rows } = await sql`SELECT data FROM polls ORDER BY created_at DESC`;
            const allPolls = rows.map(r => {
                const p = r.data as Poll;
                // Auto-publish logic
                if (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= new Date()) {
                    p.status = 'published';
                }
                return p;
            });
            if (creatorId) {
                return allPolls.filter(p => p.creatorId === creatorId);
            }
            return allPolls;
        } catch (e) {
            console.error("Error fetching from DB:", e);
        }
    }

    reloadIfNeeded();
    const processedPolls = memoryPolls.map(p => {
        if (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= new Date()) {
            return { ...p, status: 'published' as const };
        }
        return p;
    });

    if (creatorId) {
        return processedPolls.filter(p => p.creatorId === creatorId);
    }
    return processedPolls;
}

export async function savePoll(poll: Poll) {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            // Upsert using id
            await sql`
                INSERT INTO polls (id, data)
                VALUES (${poll.id}, ${JSON.stringify(poll)})
                ON CONFLICT (id) 
                DO UPDATE SET data = ${JSON.stringify(poll)}
            `;
            return;
        } catch (e) {
            console.error("Error saving to DB:", e);
        }
    }

    reloadIfNeeded(); // Make sure we have latest before modifying
    const existingIndex = memoryPolls.findIndex(p => p.id === poll.id);
    if (existingIndex >= 0) {
        memoryPolls[existingIndex] = poll;
    } else {
        memoryPolls.push(poll);
    }

    saveData();
}

export async function getPoll(id: string): Promise<Poll | undefined> {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            const { rows } = await sql`SELECT data FROM polls WHERE id = ${id}`;
            if (rows.length > 0) return rows[0].data as Poll;
        } catch (e) {
            console.error("Error fetching poll from DB:", e);
        }
    }

    reloadIfNeeded();
    const poll = memoryPolls.find(p => p.id === id);
    if (poll && poll.status === 'scheduled' && poll.scheduledAt && new Date(poll.scheduledAt) <= new Date()) {
        return { ...poll, status: 'published' as const };
    }
    return poll;
}

export async function getPollByCode(code: string): Promise<Poll | undefined> {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            // In a real app we'd probably have short_code as a separate column for indexing, 
            // but for now we search within JSONB
            const { rows } = await sql`SELECT data FROM polls WHERE data->>'shortCode' = ${code}`;
            if (rows.length > 0) return rows[0].data as Poll;
        } catch (e) {
            console.error("Error fetching poll by code from DB:", e);
        }
    }

    reloadIfNeeded();
    const poll = memoryPolls.find(p => p.shortCode === code);
    if (poll && poll.status === 'scheduled' && poll.scheduledAt && new Date(poll.scheduledAt) <= new Date()) {
        return { ...poll, status: 'published' as const };
    }
    return poll;
}

export async function incrementPollVisitors(id: string) {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            // Get current poll, increment, and save
            const { rows } = await sql`SELECT data FROM polls WHERE id = ${id}`;
            if (rows.length > 0) {
                const poll = rows[0].data as Poll;
                poll.visitors = (poll.visitors || 0) + 1;
                await sql`
                    UPDATE polls 
                    SET data = ${JSON.stringify(poll)}
                    WHERE id = ${id}
                `;
            }
            return;
        } catch (e) {
            console.error("Error incrementing visitors in DB:", e);
        }
    }

    reloadIfNeeded();
    const poll = memoryPolls.find(p => p.id === id);
    if (poll) {
        poll.visitors = (poll.visitors || 0) + 1;
        saveData();
    }
}

export async function deletePollFromStore(id: string) {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            await sql`DELETE FROM polls WHERE id = ${id}`;
            return;
        } catch (e) {
            console.error("Error deleting from DB:", e);
        }
    }

    reloadIfNeeded();
    memoryPolls = memoryPolls.filter(p => p.id !== id);
    saveData();
}

// ----------------------------------------------------------------------
// Presentation Management (Memory / File Only for now, unless Postgres requested)
// ----------------------------------------------------------------------

export async function getPresentations(creatorId?: string): Promise<Presentation[]> {
    reloadIfNeeded();
    // For now, no Postgres implementation for slides as it wasn't strictly requested to reuse the DB immediately, 
    // but the pattern suggests we should. For MVP, memory/file is faster to implement.
    // If user wants DB later, we can add ensureTable logic here.

    if (creatorId) {
        return memoryPresentations.filter(p => p.creatorId === creatorId);
    }
    return memoryPresentations;
}

export async function getPresentation(id: string): Promise<Presentation | undefined> {
    reloadIfNeeded();
    const presentation = memoryPresentations.find(p => p.id === id);

    // Lazy migration: If shortCode is missing, generate it and save
    if (presentation && !presentation.shortCode) {
        presentation.shortCode = Math.floor(10000 + Math.random() * 90000).toString();
        // Save the update back to store
        await savePresentation(presentation);
    }


    return presentation;
}

export async function savePresentation(presentation: Presentation) {

    reloadIfNeeded();
    const existingIndex = memoryPresentations.findIndex(p => p.id === presentation.id);
    if (existingIndex >= 0) {
        memoryPresentations[existingIndex] = presentation;
    } else {
        memoryPresentations.push(presentation);
    }
    saveData();
}

export async function deletePresentation(id: string) {
    reloadIfNeeded();
    memoryPresentations = memoryPresentations.filter(p => p.id !== id);
    saveData();
}

export async function getPresentationByCode(code: string): Promise<Presentation | undefined> {
    reloadIfNeeded();
    return memoryPresentations.find(p => p.shortCode === code);
}
