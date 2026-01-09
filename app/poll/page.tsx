import { JoinPollForm } from "@/components/poll/join-poll-form";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JoinPage() {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-primary/20">
            {/* Modern Mesh Background */}
            <div className="bg-mesh opacity-40" />

            {/* Header */}
            <header className="container mx-auto px-6 h-20 flex items-center justify-between z-20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">PollMaker</span>
                </Link>
                <Link href="/">
                    <Button variant="ghost" size="sm" className="rounded-full font-bold">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back Home
                    </Button>
                </Link>
            </header>

            <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center relative z-10 py-20">
                <div className="w-full max-w-xl mx-auto space-y-12 text-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Join a Session
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-none">
                            Enter Poll <span className="gradient-text">Code</span>.
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto">
                            Got a 5-digit code? Enter it below to instantly join the conversation and cast your vote.
                        </p>
                    </div>

                    <div className="glass-card p-10 md:p-16 rounded-[2.5rem] shadow-2xl shadow-primary/10 border-2 border-primary/5">
                        <JoinPollForm />
                    </div>

                    <div className="pt-8">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                            Enter the code shared by the poll creator
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
