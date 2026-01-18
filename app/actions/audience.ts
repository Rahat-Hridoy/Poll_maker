'use server'

import { getPresentation, getPresentationByCode, savePresentation } from "@/lib/store";
import { revalidatePath } from "next/cache";

export async function joinPresentationAction(code: string) {
    const presentation = await getPresentationByCode(code);
    if (!presentation) {
        return { error: "Invalid Join Code" };
    }
    return { success: true, presentationId: presentation.id };
}

export async function updatePresenterStateAction(presentationId: string, slideIndex: number) {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return;

    presentation.currentSlideIndex = slideIndex;
    await savePresentation(presentation);
    revalidatePath(`/live/${presentationId}`);
}

export async function submitVoteAction(presentationId: string, slideId: string, optionId: string, userName: string = 'Anonymous') {
    const presentation = await getPresentation(presentationId);
    if (!presentation) return { error: "Presentation not found" };

    const slideIndex = presentation.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return { error: "Slide not found" };

    const slide = presentation.slides[slideIndex];
    let elements: any[] = [];
    try {
        elements = JSON.parse(slide.content);
    } catch {
        return { error: "Failed to parse slide content" };
    }

    // Find the poll/quiz element
    const pollElementIndex = elements.findIndex(el => ['poll-template', 'quiz-template', 'qa-template'].includes(el.type));

    if (pollElementIndex === -1) return { error: "No poll/quiz found on this slide" };

    const pollElement = elements[pollElementIndex];
    let pollData;
    try {
        pollData = JSON.parse(pollElement.content);
    } catch {
        return { error: "Invalid poll data" };
    }

    // Initialize responses array if needed
    if (!pollData.responses) {
        pollData.responses = [];
    }

    // Check if user already voted (optional check, client should handle it mostly, but good for safety)
    // For now we allow multiple votes from same name if testing, or we could strict it.
    // Let's just append.

    // Update votes count (Legacy/Simple count)
    const optionIndex = pollData.options.findIndex((o: any) => o.id === optionId);
    if (optionIndex !== -1) {
        pollData.options[optionIndex].votes = (pollData.options[optionIndex].votes || 0) + 1;
    }

    // Store detailed response
    pollData.responses.push({
        userId: crypto.randomUUID(), // Or session ID if we had one
        userName: userName,
        optionId: optionId,
        timestamp: new Date().toISOString()
    });

    // Save back
    pollElement.content = JSON.stringify(pollData);
    elements[pollElementIndex] = pollElement;
    slide.content = JSON.stringify(elements);
    presentation.slides[slideIndex] = slide;

    // Use current timestamp to force refresh on clients
    presentation.updatedAt = new Date().toISOString();
    await savePresentation(presentation);

    // Revalidate paths for real-time updates
    revalidatePath(`/presentation/${presentationId}`);
    revalidatePath(`/live/${presentationId}`);
    revalidatePath(`/editor/${presentationId}/results`); // Ensure results page updates

    return { success: true };
}
