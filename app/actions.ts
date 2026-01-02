'use server'

import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function getPolls() {
    try {
        const response = await fetch(`${BACKEND_URL}/polls`, { cache: 'no-store' });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Error fetching polls:", error);
        return [];
    }
}

export async function getPoll(id: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/polls/${id}`, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching poll ${id}:`, error);
        return null;
    }
}

export async function createPoll(formData: any) {
    try {
        const response = await fetch(`${BACKEND_URL}/polls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to create poll");
        }

        const data = await response.json();
        revalidatePath('/admin/dashboard');
        return { success: true, pollId: data.id };
    } catch (error: any) {
        console.error("Create poll error:", error);
        return { success: false, error: error.message || "Failed to create poll" };
    }
}

export async function submitVote(pollId: string, answers: Record<string, string>, voterInfo: { name: string, email: string }) {
    try {
        const response = await fetch(`${BACKEND_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, voterInfo }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Vote failed");
        }

        revalidatePath(`/admin/${pollId}/stats`);
        revalidatePath(`/poll/${pollId}`);
        revalidatePath(`/admin/dashboard`);

        return { success: true };
    } catch (error: any) {
        console.error("Vote submission error:", error);
        return { success: false, error: error.message || "Failed to submit vote" };
    }
}

export async function deletePoll(id: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/polls/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error("Delete failed");

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting poll:", error);
        return { success: false, error: "Failed to delete poll" };
    }
}
