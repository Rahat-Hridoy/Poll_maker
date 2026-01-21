'use server'

import { revalidatePath } from 'next/cache';
import { getPresentation, savePresentation } from '@/lib/store';
import { QAQuestion } from '@/lib/data';

export async function submitQuestion(presentationId: string, slideId: string, text: string, author: string = "Anonymous") {
    try {
        const presentation = await getPresentation(presentationId);
        if (!presentation) {
            return { success: false, error: "Presentation not found" };
        }

        // Initialize qaSessions if it doesn't exist
        if (!presentation.qaSessions) {
            presentation.qaSessions = {};
        }

        // Initialize questions array for this slide if it doesn't exist
        if (!presentation.qaSessions[slideId]) {
            presentation.qaSessions[slideId] = [];
        }

        const newQuestion: QAQuestion = {
            id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: text.trim(),
            author: author.trim() || "Anonymous",
            submittedAt: new Date().toISOString(),
            upvotes: 0,
            isAnswered: false
        };

        presentation.qaSessions[slideId].push(newQuestion);
        
        // Update sorting? For now just append.
        
        // Update timestamp to trigger polling detection
        presentation.updatedAt = new Date().toISOString(); 
        
        await savePresentation(presentation);
        revalidatePath(`/live/${presentationId}`);
        return { success: true, question: newQuestion };
    } catch (error) {
        console.error("Error submitting question:", error);
        return { success: false, error: "Failed to submit question" };
    }
}
