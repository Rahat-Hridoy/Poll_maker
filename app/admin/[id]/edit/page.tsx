import { PollForm } from "@/components/poll/poll-form";
import { getPoll } from "@/lib/store";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

// In a real app, this would be async and fetch data
export default async function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const poll = await getPoll(id);

    if (!poll) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Poll</h2>
                <p className="text-muted-foreground">
                    Make changes to <strong>{poll?.title}</strong>
                </p>
            </div>

            <PollForm initialData={poll} />
        </div>
    );
}
