import { PollViewer } from "@/components/poll/poll-viewer";
import { getPoll } from "@/lib/store";
import { notFound } from "next/navigation";

export default async function PublicPollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const poll = getPoll(id);

    if (!poll) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <PollViewer poll={poll} />
        </div>
    );
}
