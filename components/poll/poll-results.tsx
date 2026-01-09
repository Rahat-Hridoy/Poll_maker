"use client"

import { useEffect, useState } from "react";
import { Poll, PollStyle } from "@/lib/data";
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

    const style = (poll as any).style as PollStyle || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8 rounded-3xl" style={{ backgroundColor: style.backgroundColor, color: style.textColor, fontFamily: style.fontFamily }}>
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="rounded-full p-3" style={{ backgroundColor: `${style.primaryColor}20`, color: style.primaryColor }}>
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: style.title?.color || style.textColor }}>Thank you for voting!</h2>
                <p className="text-muted-foreground opacity-80">Here are the live results for: <span className="font-semibold" style={{ color: style.primaryColor }}>{poll.title}</span></p>
                {isLive && <span className="text-xs font-medium animate-pulse" style={{ color: style.primaryColor }}>● Live updates active</span>}
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center opacity-90">Current Standings</h3>
                <div className="grid gap-6 md:grid-cols-1">
                    {poll.questions.map((q) => (
                        <VoteChart
                            key={q.id}
                            question={q.text}
                            data={q.options.map((o: any) => ({ name: o.text, votes: o.votes }))}
                            color={style.primaryColor}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    style={{
                        borderColor: style.primaryColor,
                        color: style.primaryColor,
                        borderRadius: style.boxShape === 'pill' ? '9999px' : '0.5rem'
                    }}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Vote Again (Reload)
                </Button>
            </div>
        </div>
    );
}
