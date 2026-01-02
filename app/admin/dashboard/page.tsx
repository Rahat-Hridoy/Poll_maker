import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPolls } from "@/lib/store";
import { Plus, BarChart2, Edit, ExternalLink, Trash2 } from "lucide-react";
import { DeletePollButton } from "@/components/poll/delete-poll-button";

export default function AdminDashboard() {
    const polls = getPolls();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Manage your polls and view analytics.</p>
                </div>
                <Link href="/admin/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create New Poll
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {polls.map((poll) => (
                    <Card key={poll.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="truncate pr-4">{poll.title}</CardTitle>
                                <div className="flex gap-2">
                                    <DeletePollButton id={poll.id} />
                                    <Badge variant={poll.status === 'published' ? 'default' : 'secondary'}>
                                        {poll.status}
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription className="line-clamp-2">
                                {poll.description || "No description provided."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">{poll.totalVotes}</span>
                                    <span>Total Votes</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-semibold text-foreground">{poll.visitors}</span>
                                    <span>Visitors</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
                            <Link href={`/admin/${poll.id}/stats`}>
                                <Button variant="ghost" size="sm" className="h-8">
                                    <BarChart2 className="mr-2 h-3.5 w-3.5" /> Stats
                                </Button>
                            </Link>
                            <div className="flex gap-2">
                                <Link href={`/admin/${poll.id}/edit`}>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                                    </Button>
                                </Link>
                                {poll.status === 'published' && (
                                    <Link href={`/poll/${poll.id}`} target="_blank">
                                        <Button variant="secondary" size="sm" className="h-8">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {polls.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No polls created yet. Click "Create New Poll" to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
