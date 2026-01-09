'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findPollByCode } from '@/app/actions';
import { ArrowRight, Hash, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function JoinPollForm() {
    const [code, setCode] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 5) return;

        setIsPending(true);
        setError('');
        try {
            const result = await findPollByCode(code);
            if (result.success && result.pollId) {
                router.push(`/poll/${result.pollId}`);
            } else {
                setError('Poll not found. Please check the code.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-4">
            <form onSubmit={handleJoin} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Hash className="h-5 w-5" />
                </div>
                <Input
                    type="text"
                    placeholder="5-digit code"
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className={cn(
                        "h-16 pl-14 pr-36 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-md shadow-inner transition-all focus:ring-primary focus:border-primary text-2xl font-black tracking-[0.4em] placeholder:tracking-normal placeholder:text-sm placeholder:font-bold placeholder:text-muted-foreground/30",
                        error && "border-destructive focus:border-destructive focus:ring-destructive"
                    )}
                />
                <div className="absolute right-2 top-2 bottom-2">
                    <Button
                        type="submit"
                        disabled={code.length !== 5 || isPending}
                        className="h-full rounded-xl bg-primary hover:primary/90 text-primary-foreground font-black px-6 shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <div className="flex items-center gap-2">
                                <span>Join</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </div>
            </form>
            {error && (
                <p className="text-sm font-bold text-red-500 text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </p>
            )}
        </div>
    );
}
