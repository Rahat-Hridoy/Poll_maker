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
    // console.log(`[Action] Updating presentation ${presentation.id}. Slides: ${presentation.slides.length}, Slide 1 content len: ${presentation.slides[0]?.content.length}`);
    presentation.updatedAt = new Date().toISOString();
    await savePresentation(presentation);
    revalidatePath(`/editor/${presentation.id}`); // Fix: Revalidate the specific editor page
    revalidatePath(`/presentation/${presentation.id}`); // Fix: Revalidate the presentation viewer
    revalidatePath('/admin/slides');
}

export async function fetchPresentation(id: string) {
    return await getPresentation(id);
}
