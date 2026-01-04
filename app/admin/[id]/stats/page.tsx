import { VoteChart } from "@/components/poll/vote-chart";
import { getPoll } from "@/lib/store";
import { ArrowLeft, Users, Vote } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function PollStatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch from store
    const poll = await getPoll(id);

    if (!poll) {
        notFound();
    }

    // Type assertion to access 'clients' which we added in our action but might not be in the base interface
    const pollWithClients = poll as any;
    const clients = pollWithClients.clients || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{poll?.title} Analytics</h2>
                    <p className="text-muted-foreground">Real-time engagement stats</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                        <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{poll?.totalVotes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{poll?.visitors}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {poll?.questions.map((q) => (
                    <VoteChart
                        key={q.id}
                        question={q.text}
                        data={q.options.map(o => ({ name: o.text, votes: o.votes }))}
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
                            {clients.map((client: any, i: number) => (
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
