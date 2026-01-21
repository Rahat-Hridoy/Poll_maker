'use server'

import { getPresentations, savePresentation, deletePresentation, getPresentation } from "@/lib/store";
import { Presentation } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function fetchPresentations() {
    return await getPresentations();
}

export async function createPresentationAction(title: string) {
    const newPresentation: Presentation = {
        id: crypto.randomUUID(),
        shortCode: Math.floor(10000 + Math.random() * 90000).toString(), // Generate 5 digit code
        title: title || "Untitled Presentation",
        theme: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slides: [
            {
                id: crypto.randomUUID(),
                content: '[]',
                background: "#ffffff",
                layout: 'blank'
            }
        ]
    };
    await savePresentation(newPresentation);
    revalidatePath('/admin/slides');
    return newPresentation;
}

export async function deletePresentationAction(id: string) {
    await deletePresentation(id);
    revalidatePath('/admin/slides');
}

export async function updatePresentationAction(presentation: Presentation) {
    presentation.updatedAt = new Date().toISOString();
    await savePresentation(presentation);
    revalidatePath(`/editor/${presentation.id}`); // Fix: Revalidate the specific editor page
    revalidatePath(`/presentation/${presentation.id}`); // Fix: Revalidate the presentation viewer
    revalidatePath('/admin/slides');
}

export async function fetchPresentation(id: string) {
    return await getPresentation(id);
}

export async function updateSlideStateAction(presentationId: string, slideId: string, updates: Partial<any>) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { success: false, error: "Presentation not found" };

    const slideIndex = presentation.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return { success: false, error: "Slide not found" };

    const slide = presentation.slides[slideIndex];
    
    // Merge updates
    const updatedSlide = { ...slide, ...updates };
    
    // Deep merge timer if present to prevent overwriting
    if (updates.timer && slide.timer) {
        updatedSlide.timer = { ...slide.timer, ...updates.timer };
    }

    presentation.slides[slideIndex] = updatedSlide;
    presentation.updatedAt = new Date().toISOString();

    await savePresentation(presentation);
    revalidatePath(`/presentation/${presentationId}`);
    revalidatePath(`/view/${presentationId}`);
    revalidatePath(`/live/${presentationId}`);
    
    return { success: true };
}

export async function updatePresentationStateAction(presentationId: string, updates: Partial<Presentation>) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { success: false, error: "Presentation not found" };

    Object.assign(presentation, updates);
    presentation.updatedAt = new Date().toISOString();

    await savePresentation(presentation);
    revalidatePath(`/presentation/${presentationId}`);
    revalidatePath(`/view/${presentationId}`);
    revalidatePath(`/live/${presentationId}`);

    return { success: true };
}

export async function updatePresenterStateAction(presentationId: string, currentSlideIndex: number) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { success: false, error: "Presentation not found" };

    presentation.currentSlideIndex = currentSlideIndex;
    presentation.updatedAt = new Date().toISOString();

    await savePresentation(presentation);
    revalidatePath(`/presentation/${presentationId}`);
    revalidatePath(`/view/${presentationId}`);
    revalidatePath(`/live/${presentationId}`);

    return { success: true };
}

export async function resetSlideResultsAction(presentationId: string, slideId: string) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { success: false, error: "Presentation not found" };

    const slide = presentation.slides.find(s => s.id === slideId);
    if (!slide) return { success: false, error: "Slide not found" };

    let hasChanges = false;

    // 1. Reset Q&A
    if (presentation.qaSessions && presentation.qaSessions[slideId]) {
        presentation.qaSessions[slideId] = [];
        hasChanges = true;
    }

    // 2. Reset Poll/Quiz Votes
    try {
        const contentElements = JSON.parse(slide.content);
        let contentChanged = false;

        const resetElement = (el: any) => {
            if (el.type === 'poll-template' || el.type === 'quiz-template') {
                 if (typeof el.content === 'string') {
                     try {
                         const innerContent = JSON.parse(el.content);
                         if (innerContent.options) {
                             innerContent.options.forEach((o: any) => o.votes = 0);
                             el.content = JSON.stringify(innerContent);
                             contentChanged = true;
                         }
                     } catch (e) { /* ignore */ }
                 }
            }
        }
        
        if (Array.isArray(contentElements)) {
            contentElements.forEach(resetElement);
        }

        if (contentChanged) {
             slide.content = JSON.stringify(contentElements);
             hasChanges = true;
        }

    } catch (e) {
        console.error("Error parsing slide content for reset", e);
    }

    if (hasChanges) {
        presentation.updatedAt = new Date().toISOString();
        await savePresentation(presentation);
        revalidatePath(`/presentation/${presentationId}`);
        revalidatePath(`/view/${presentationId}`);
        revalidatePath(`/live/${presentationId}`);
    }
    
    return { success: true };
}

export async function incrementAudienceCountAction(presentationId: string) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { success: false, error: "Presentation not found" };

    presentation.visitors = (presentation.visitors || 0) + 1;
    // Don't update updatedAt to avoid triggering heavy re-renders or race conditions for simple counter
    // But we might need it for polling to pick it up?
    // Let's rely on revalidatePath
    
    await savePresentation(presentation);
    revalidatePath(`/presentation/${presentationId}`);
    
    return { success: true, count: presentation.visitors };
}
