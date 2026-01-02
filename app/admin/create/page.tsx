import { PollForm } from "@/components/poll/poll-form";

export default function CreatePollPage() {
    return (
        <div className="max-w-4xl mx-auto py-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create a New Poll</h2>
                <p className="text-muted-foreground">
                    Design your poll, add questions, and get ready to share.
                </p>
            </div>

            <PollForm />
        </div>
    );
}
