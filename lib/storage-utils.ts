import { Presentation } from "./data";

const STORAGE_KEY = "poll_maker_presentations";

export const LocalPresentationStore = {
    getAllPresentations: (): Presentation[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load from local storage", e);
            return [];
        }
    },

    getPresentation: (id: string): Presentation | null => {
        const presentations = LocalPresentationStore.getAllPresentations();
        return presentations.find(p => p.id === id) || null;
    },

    savePresentation: (presentation: Presentation) => {
        if (typeof window === "undefined") return;
        try {
            const presentations = LocalPresentationStore.getAllPresentations();
            const index = presentations.findIndex(p => p.id === presentation.id);

            if (index >= 0) {
                presentation.updatedAt = new Date().toISOString(); // Ensure fresh timestamp
                presentations[index] = presentation;
            } else {
                presentations.unshift(presentation); // Add new to top
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
        } catch (e) {
            console.error("Failed to save to local storage", e);
        }
    },

    deletePresentation: (id: string) => {
        if (typeof window === "undefined") return;
        try {
            const presentations = LocalPresentationStore.getAllPresentations();
            const filtered = presentations.filter(p => p.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error("Failed to delete from local storage", e);
        }
    },

    // Sync helper: Merges server list with local list, preferring newer modified times
    syncWithServer: (serverPresentations: Presentation[]) => {
        if (typeof window === "undefined") return serverPresentations;

        const local = LocalPresentationStore.getAllPresentations();
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
