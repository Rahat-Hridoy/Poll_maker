import { PollViewer } from "@/components/poll/poll-viewer";
import { getPoll } from "@/lib/store";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PublicPollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const poll = await getPoll(id);

    if (!poll) {
        // Fallback for Vercel/Serverless cold starts where in-memory state is lost
        if (id.startsWith('poll-')) {
            return (
                <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Poll Session Expired (Demo Limitation)</h1>
                    <p className="text-muted-foreground">
                        Since this is a demo running on Vercel's serverless platform, data is stored in memory and may be lost when the server "sleeps".
                    </p>
                    <Link href="/admin/create">
                        <Button>Create a New Poll</Button>
                    </Link>
                </div>
            );
        }
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <PollViewer poll={poll} />
        </div>
    );
}
