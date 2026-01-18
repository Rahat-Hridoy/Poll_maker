import { Presentation } from "./data";
import { get, set } from 'idb-keyval';

const STORAGE_KEY = "poll_maker_presentations";

export const LocalPresentationStore = {
    getAllPresentations: async (): Promise<Presentation[]> => {
        if (typeof window === "undefined") return [];
        try {
            // Migration Strategy: Check LocalStorage first
            const localStored = localStorage.getItem(STORAGE_KEY);
            if (localStored) {
                try {
                    console.log("Migrating presentations from LocalStorage to IndexedDB...");
                    const parsed = JSON.parse(localStored);
                    await set(STORAGE_KEY, parsed);
                    localStorage.removeItem(STORAGE_KEY); // Clear old storage to free up quota
                    return parsed;
                } catch (e) {
                    console.error("Migration failed:", e);
                }
            }

            // Normal IndexedDB retrieval
            const stored = await get<Presentation[]>(STORAGE_KEY);
            return stored || [];
        } catch (e) {
            console.error("Failed to load from storage", e);
            return [];
        }
    },

    getPresentation: async (id: string): Promise<Presentation | null> => {
        const presentations = await LocalPresentationStore.getAllPresentations();
        return presentations.find(p => p.id === id) || null;
    },

    savePresentation: async (presentation: Presentation) => {
        if (typeof window === "undefined") return;
        try {
            const presentations = await LocalPresentationStore.getAllPresentations();
            const index = presentations.findIndex(p => p.id === presentation.id);

            if (index >= 0) {
                presentation.updatedAt = new Date().toISOString(); // Ensure fresh timestamp
                presentations[index] = presentation;
            } else {
                presentations.unshift(presentation); // Add new to top
            }

            await set(STORAGE_KEY, presentations);
        } catch (e) {
            console.error("Failed to save to storage", e);
        }
    },

    deletePresentation: async (id: string) => {
        if (typeof window === "undefined") return;
        try {
            const presentations = await LocalPresentationStore.getAllPresentations();
            const filtered = presentations.filter(p => p.id !== id);
            await set(STORAGE_KEY, filtered);
        } catch (e) {
            console.error("Failed to delete from storage", e);
        }
    },

    // Sync helper: Merges server list with local list, preferring newer modified times
    syncWithServer: async (serverPresentations: Presentation[]): Promise<Presentation[]> => {
        if (typeof window === "undefined") return serverPresentations;

        const local = await LocalPresentationStore.getAllPresentations();
        const mergedMap = new Map<string, Presentation>();

        // Add server items first
        serverPresentations.forEach(p => mergedMap.set(p.id, p));

        // Merge local items
        local.forEach(p => {
            const existing = mergedMap.get(p.id);
            if (!existing) {
                // Exists locally but not on server (e.g. newly created on Vercel)
                mergedMap.set(p.id, p);
            } else {
                // Exists on both: pick newer
                const serverDate = new Date(existing.updatedAt).getTime();
                const localDate = new Date(p.updatedAt).getTime();
                if (localDate > serverDate) {
                    mergedMap.set(p.id, p);
                }
            }
        });

        return Array.from(mergedMap.values()).sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
};
