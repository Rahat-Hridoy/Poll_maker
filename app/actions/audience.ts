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

export async function submitVoteAction(presentationId: string, slideId: string, optionId: string) {
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

    // Find the poll element (poll-template or poll)
    // We assume there's one poll per slide usually, or we find the right one if we had elementId.
    // For simplicity, we find the first element associated with a poll.
    // Actually, `submitVote` usually implies finding the poll.
    // But our templates store data inside `content` string.

    // Strategy: Look for 'poll-template'
    const pollElementIndex = elements.findIndex(el => el.type === 'poll-template');

    if (pollElementIndex === -1) return { error: "No poll found on this slide" };

    const pollElement = elements[pollElementIndex];
    let pollData;
    try {
        pollData = JSON.parse(pollElement.content);
    } catch {
        return { error: "Invalid poll data" };
    }

    // Update votes
    const optionIndex = pollData.options.findIndex((o: any) => o.id === optionId);
    if (optionIndex === -1) return { error: "Option not found" };

    pollData.options[optionIndex].votes = (pollData.options[optionIndex].votes || 0) + 1;

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

    return { success: true };
}
