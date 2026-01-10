'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Edit, ExternalLink, ArrowUpFromLine, CheckSquare, Square, QrCode, LayoutGrid, List, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeletePollButton } from '@/components/poll/delete-poll-button';
import { Poll } from '@/lib/data';
import { ShareDialog } from '@/components/admin/share-dialog';
import { CountdownTimer } from './countdown-timer';

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

export function PollList({ polls: initialPolls }: PollListProps) {
    const [polls, setPolls] = useState<Poll[]>(initialPolls);
    const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const [origin, setOrigin] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    useEffect(() => {
        setOrigin(window.location.origin);

        // Live polling for dashboard updates
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/polls', { cache: 'no-store' });
                if (response.ok) {
                    const updatedPolls = await response.json();
                    setPolls(updatedPolls);
                }
            } catch (error) {
                console.error('Failed to poll dashboard updates:', error);
            }
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
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
                <Link href="/create/editor?template=Blank%20Canvas">
                    <Button variant="outline">Create your first poll</Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-full transition-all",
                                viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-full transition-all",
                                viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"
                            )}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                    <span className="text-sm font-semibold text-slate-500">
                        {selectedPolls.size} selected
                    </span>
                    {selectedPolls.size > 0 && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setSelectedPolls(new Set())}>
                            Clear
                        </Button>
                    )}
                </div>

                <Button
                    variant="default"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || selectedPolls.size === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 transition-all"
                >
                    <ArrowUpFromLine className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className={cn(
                    "grid gap-4 transition-all duration-500",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}
            >
                {polls.map((poll) => (
                    <motion.div key={poll.id} variants={item} className="relative group">
                        {viewMode === 'grid' && (
                            <div className={`absolute top-3 right-3 z-10 transition-all duration-200 ${selectedPolls.has(poll.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div
                                    onClick={() => toggleSelection(poll.id)}
                                    className={`cursor-pointer p-1 bg-white dark:bg-slate-800 rounded-md shadow-md transition-colors border border-slate-200 dark:border-slate-700 ${selectedPolls.has(poll.id) ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-500'}`}
                                >
                                    {selectedPolls.has(poll.id) ? (
                                        <CheckSquare className="h-5 w-5 fill-current" />
                                    ) : (
                                        <Square className="h-5 w-5" />
                                    )}
                                </div>
                            </div>
                        )}

                        <Card className={cn(
                            "group transition-all duration-300 border-2 overflow-hidden",
                            selectedPolls.has(poll.id) ? 'border-indigo-500 shadow-xl bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm hover:shadow-md',
                            viewMode === 'list' && "flex flex-col md:flex-row items-center p-3 gap-6"
                        )}>
                            {viewMode === 'grid' ? (
                                <>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="truncate text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {poll.title}
                                            </CardTitle>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Badge className={cn(
                                                "px-2 py-0 border-none rounded-full text-[10px] font-black uppercase tracking-widest",
                                                poll.status === 'published' ? 'bg-emerald-100 text-emerald-700' : poll.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            )}>
                                                {poll.status}
                                            </Badge>
                                            {poll.status === 'scheduled' && poll.scheduledAt && (
                                                <CountdownTimer targetDate={poll.scheduledAt} />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-4">
                                        <p className="line-clamp-2 text-sm text-slate-500 mt-2 min-h-[40px]">
                                            {poll.description || "Crafted for maximum engagement."}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col items-center border-r border-slate-200 dark:border-slate-700">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{poll.totalVotes}</span>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Votes</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{poll.visitors}</span>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Reach</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
                                        <Link href={`/admin/${poll.id}/stats`} className="flex-1">
                                            <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold group/btn">
                                                <BarChart2 className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" /> Insights
                                            </Button>
                                        </Link>
                                        <ShareDialog
                                            url={`${origin}/poll/${poll.id}`}
                                            shortCode={poll.shortCode}
                                            title={poll.title}
                                            trigger={
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <div className="flex gap-2">
                                            <DeletePollButton id={poll.id} />
                                            <Link href={`/create/editor?id=${poll.id}`}>
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </>
                            ) : (
                                /* List View Variant */
                                <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full px-4 gap-4">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(poll.id); }}
                                        className={cn(
                                            "cursor-pointer p-2 rounded-lg transition-all shrink-0",
                                            selectedPolls.has(poll.id) ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        {selectedPolls.has(poll.id) ? (
                                            <CheckSquare className="h-5 w-5 fill-current" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                            <BarChart2 className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate">{poll.title}</h3>
                                                {poll.status === 'scheduled' && poll.scheduledAt && (
                                                    <div className="scale-90 shrink-0">
                                                        <CountdownTimer targetDate={poll.scheduledAt} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <Badge className={cn(
                                                    "px-2 py-0 border-none rounded-full text-[8px] font-black uppercase tracking-widest",
                                                    poll.status === 'published' ? 'bg-emerald-100 text-emerald-700' : poll.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                )}>
                                                    {poll.status}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-medium">Created {new Date(poll.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex items-center gap-8 px-6 border-x border-slate-100 dark:border-slate-800">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{poll.totalVotes}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Votes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{poll.visitors}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Reach</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link href={`/admin/${poll.id}/stats`}>
                                            <Button variant="ghost" size="sm" className="h-10 rounded-xl hover:bg-slate-100 transition-all font-bold">
                                                Stats
                                            </Button>
                                        </Link>
                                        <ShareDialog
                                            url={`${origin}/poll/${poll.id}`}
                                            shortCode={poll.shortCode}
                                            title={poll.title}
                                            trigger={
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <Link href={`/create/editor?id=${poll.id}`}>
                                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeletePollButton id={poll.id} />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
