import { RealTimeStats } from "@/components/poll/real-time-stats";
import { getPoll } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function PollStatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch initial data from store
    const poll = await getPoll(id);

    if (!poll) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{poll.title} Analytics</h2>
                    <p className="text-muted-foreground">Real-time engagement stats</p>
                </div>
            </div>

            {/* Real-time stats component handles polling and updates */}
            <RealTimeStats initialPoll={poll} />
        </div>
    );
}
