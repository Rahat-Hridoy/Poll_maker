"use client"

import { useEffect, useState } from "react";
import { Poll } from "@/lib/data";
import { VoteChart } from "./vote-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Users, Radio } from "lucide-react";

interface RealTimeStatsProps {
    initialPoll: Poll;
}

export function RealTimeStats({ initialPoll }: RealTimeStatsProps) {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        // Poll for updates every 2 seconds
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/polls/${poll.id}`, {
                    cache: 'no-store'
                });

                if (response.ok) {
                    const updatedPoll = await response.json();
                    setPoll(updatedPoll);
                    setIsLive(true);
                } else {
                    setIsLive(false);
                }
            } catch (error) {
                console.error('Error fetching poll updates:', error);
                setIsLive(false);
            }
        }, 2000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [poll.id]);

    // Handle visibility changes to pause polling when tab is inactive
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsLive(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const clients = poll.clients || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Radio className={`h-4 w-4 ${isLive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span>{isLive ? 'Live updates active' : 'Updates paused'}</span>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                        <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{poll.totalVotes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{poll.visitors}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Vote Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {poll.questions.map((q) => (
                    <VoteChart
                        key={q.id}
                        question={q.text}
                        data={q.options.map((o) => ({ name: o.text, votes: o.votes }))}
                    />
                ))}
            </div>

            {/* Visitor Log Table */}
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Clients</CardTitle>
                </CardHeader>
                <CardContent>
                    {clients.length > 0 ? (
                        <div className="space-y-4">
                            {clients.map((client, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{client.name}</p>
                                        <p className="text-sm text-muted-foreground">{client.email}</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{new Date(client.time).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No votes yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
