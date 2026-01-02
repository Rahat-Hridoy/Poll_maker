import { PollForm } from "@/components/poll/poll-form";
import { MOCK_POLLS } from "@/lib/data";

// In a real app, this would be async and fetch data
export default async function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
    // Mock data fetching logic
    // Since this is a server component in App Router, we usually await params
    // But for static demo we'll assume it works or fix if Next.js 15+ needs await
    const { id } = await params;
    const poll = MOCK_POLLS.find(p => p.id === id) || MOCK_POLLS[0];

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
