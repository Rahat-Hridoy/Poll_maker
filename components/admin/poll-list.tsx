'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Edit, ExternalLink, ArrowUpFromLine, CheckSquare, Square, QrCode } from 'lucide-react';
import { DeletePollButton } from '@/components/poll/delete-poll-button';
import { Poll } from '@/lib/data';
import { QRCodeDialog } from '@/components/admin/qr-code-dialog';

interface PollListProps {
    polls: Poll[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function PollList({ polls }: PollListProps) {
    const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedPolls);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedPolls(newSelection);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollIds: Array.from(selectedPolls) }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `polls_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export polls.');
        } finally {
            setIsExporting(false);
        }
    };

    if (polls.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10"
            >
                <div className="text-muted-foreground mb-4">No polls created yet.</div>
                <Link href="/admin/create">
                    <Button variant="outline">Create your first poll</Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        {selectedPolls.size} selected
                    </span>
                    {selectedPolls.size > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPolls(new Set())}>
                            Clear
                        </Button>
                    )}
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || selectedPolls.size === 0}
                >
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export Selected'}
                </Button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {polls.map((poll) => (
                    <motion.div key={poll.id} variants={item} className="relative group">
                        {/* Selection Overlay/Checkbox */}
                        <div className={`absolute top-3 right-3 z-10 transition-all duration-200 ${selectedPolls.has(poll.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div
                                onClick={() => toggleSelection(poll.id)}
                                className={`cursor-pointer bg-background rounded-sm shadow-sm transition-colors ${selectedPolls.has(poll.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {selectedPolls.has(poll.id) ? (
                                    <CheckSquare className="h-6 w-6 fill-primary/10" />
                                ) : (
                                    <Square className="h-6 w-6" />
                                )}
                            </div>
                        </div>

                        <Card className={`flex flex-col h-full transition-all duration-300 border-2 ${selectedPolls.has(poll.id) ? 'border-primary shadow-md bg-primary/5' : 'border-transparent hover:border-primary/20 hover:shadow-lg'}`}>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-8">
                                    <CardTitle className="truncate text-lg font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                                        {poll.title}
                                    </CardTitle>
                                    {/* Spacer for checkbox */}
                                    <div className="w-6 shrink-0"></div>
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant={poll.status === 'published' ? 'default' : 'secondary'} className="animate-in fade-in">
                                        {poll.status}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 min-h-[2.5em] mt-2">
                                    {poll.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex justify-between text-sm text-muted-foreground mt-2 p-3 bg-muted/30 rounded-md">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground text-xl">{poll.totalVotes}</span>
                                        <span className="text-xs uppercase tracking-wider">Votes</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="font-bold text-foreground text-xl">{poll.visitors}</span>
                                        <span className="text-xs uppercase tracking-wider">Visitors</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-4 bg-muted/10 gap-2">
                                <Link href={`/admin/${poll.id}/stats`} className="flex-1">
                                    <Button variant="ghost" size="sm" className="w-full hover:bg-primary/10 hover:text-primary">
                                        <BarChart2 className="mr-2 h-3.5 w-3.5" /> Stats
                                    </Button>
                                </Link>
                                <div className="flex gap-1">
                                    <DeletePollButton id={poll.id} />
                                    <Link href={`/admin/${poll.id}/edit`}>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    {poll.status === 'published' && (
                                        <>
                                            <QRCodeDialog
                                                url={`${origin}/poll/${poll.id}`}
                                                title={poll.title}
                                                trigger={
                                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0" title="Get QR Code">
                                                        <QrCode className="h-3.5 w-3.5" />
                                                    </Button>
                                                }
                                            />
                                            <Link href={`/poll/${poll.id}`} target="_blank">
                                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0" title="Open Poll">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
