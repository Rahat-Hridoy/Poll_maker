"use client"

import { useEffect, useState } from "react";
import { Poll } from "@/lib/data";
import { VoteChart } from "./vote-chart";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface PollResultsProps {
    pollId: string;
    initialPoll?: Poll;
    onReset?: () => void;
}

export function PollResults({ pollId, initialPoll, onReset }: PollResultsProps) {
    const [poll, setPoll] = useState<Poll | undefined>(initialPoll);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        // Immediate fetch to get the very latest state including the user's just-submitted vote
        const fetchPoll = async () => {
            try {
                const response = await fetch(`/api/polls/${pollId}`, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setPoll(data);
                    setIsLive(true);
                }
            } catch (e) {
                console.error("Failed to fetch poll", e);
                setIsLive(false);
            }
        };

        fetchPoll();

        // Then poll every 2 seconds
        const interval = setInterval(fetchPoll, 2000);

        // Visibility handling
        const handleVisibilityChange = () => {
            if (document.hidden) setIsLive(false);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pollId]);

    if (!poll) return <div className="text-center py-8">Loading results...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Thank you for voting!</h2>
                <p className="text-muted-foreground">Here are the live results.</p>
                {isLive && <span className="text-xs text-green-500 animate-pulse">● Live updates active</span>}
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center">Current Standings</h3>
                <div className="grid gap-6 md:grid-cols-1">
                    {poll.questions.map((q) => (
                        <VoteChart
                            key={q.id}
                            question={q.text}
                            data={q.options.map((o: any) => ({ name: o.text, votes: o.votes }))}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Vote Again (Reload)
                </Button>
            </div>
        </div>
    );
}
