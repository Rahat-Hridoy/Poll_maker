import fs from 'fs';
import path from 'path';
import { Poll, MOCK_POLLS, User } from './data';
import { sql } from '@vercel/postgres';

const DB_PATH = path.join(process.cwd(), 'data.json');

// Global in-memory store fallback
let memoryPolls: Poll[] = [];
let memoryUsers: User[] = [];
let lastFileReadTime: number = 0;

// Initialize memoryPolls with MOCK_POLLS or from file if possible (for local dev)
function initLocalStore() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const fileData = fs.readFileSync(DB_PATH, 'utf-8');
            const data = JSON.parse(fileData);
            memoryPolls = data.polls || [...MOCK_POLLS];
            memoryUsers = data.users || [];
            lastFileReadTime = Date.now();
        } else {
            memoryPolls = [...MOCK_POLLS];
            memoryUsers = [];
            try {
                fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls, users: memoryUsers }, null, 2));
                lastFileReadTime = Date.now();
            } catch (e) { }
        }
    } catch (error) {
        memoryPolls = [...MOCK_POLLS];
        memoryUsers = [];
    }
}

initLocalStore();

function reloadIfNeeded() {
    if (process.env.POSTGRES_URL) return; // DB mode doesn't need file reload

    try {
        if (fs.existsSync(DB_PATH)) {
            const stats = fs.statSync(DB_PATH);
            const fileModTime = stats.mtimeMs;

            if (fileModTime > lastFileReadTime) {
                const fileData = fs.readFileSync(DB_PATH, 'utf-8');
                const data = JSON.parse(fileData);
                memoryPolls = data.polls || [...MOCK_POLLS];
                memoryUsers = data.users || [];
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
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify({ polls: memoryPolls, users: memoryUsers }, null, 2));
        lastFileReadTime = Date.now();
    } catch (error) { }
}

export async function getPolls(creatorId?: string): Promise<Poll[]> {
    if (process.env.POSTGRES_URL) {
        await ensureTable();
        try {
            const { rows } = await sql`SELECT data FROM polls ORDER BY created_at DESC`;
            const allPolls = rows.map(r => r.data as Poll);
            if (creatorId) {
                return allPolls.filter(p => p.creatorId === creatorId);
            }
            return allPolls;
        } catch (e) {
            console.error("Error fetching from DB:", e);
        }
    }

    reloadIfNeeded();
    if (creatorId) {
        return memoryPolls.filter(p => p.creatorId === creatorId);
    }
    return memoryPolls;
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
    return memoryPolls.find(p => p.id === id);
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
