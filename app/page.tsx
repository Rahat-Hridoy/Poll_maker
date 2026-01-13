import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Zap, Layout, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-primary/20">

      {/* Modern Mesh Background */}
      <div className="bg-mesh" />

      {/* Header */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">PollMaker</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors hover:cursor-pointer">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="rounded-full px-6 bg-foreground text-background hover:opacity-90 transition-opacity font-bold">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12 md:py-20 relative z-10">

        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/50 backdrop-blur-md border border-border shadow-sm text-xs font-bold text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Advanced Analytics & Real-time Voting
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Engage your audience with <span className="gradient-text">stunning polls</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100 font-medium italic">
            Create professional, interactive polls and quizzes in seconds.
          </p>

          {/* <div className="pt-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            <Link href="/poll">
              <Button size="lg" className="rounded-2xl px-12 h-16 text-lg font-black bg-primary hover:opacity-90 shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]">
                Join a Poll <Hash className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div> */}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {/* Create Poll Card */}
          <Link href="/create/editor?template=Blank%20Canvas" className="group">
            <div className="h-full relative overflow-hidden glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 group-hover:border-primary/30">
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 duration-700 rotate-12">
                <Layout className="w-56 h-56 text-primary" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-foreground mb-3 leading-tight">Create Poll</h2>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Get instant feedback with real-time analytics. Perfect for meetings and social media.
                  </p>
                </div>
                <div className="flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                  Start Creating <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Create Quiz Card (Beta) */}
          <div className="group cursor-not-allowed opacity-80">
            <div className="h-full relative overflow-hidden bg-card/30 backdrop-blur-xl border border-border/50 p-10 rounded-[2.5rem] transition-all duration-300">
              <div className="absolute -top-10 -right-10 opacity-5 transition-opacity">
                <Zap className="w-56 h-56 text-purple-600" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shadow-lg">
                  <PlayCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-foreground/60 mb-3 flex items-center gap-3">
                    Create Quiz
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary uppercase tracking-tighter">Coming Soon</span>
                  </h2>
                  <p className="text-muted-foreground/60 leading-relaxed font-medium">
                    Engage your audience with interactive challenges and gamified experiences.
                  </p>
                </div>
                <div className="text-muted-foreground/40 font-bold">
                  Waitlist Open
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Trust Section */}
        <div className="mt-28 py-10 border-t border-border/50 w-full max-w-6xl text-center">
          <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-10">Trusted by organizations worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="text-2xl font-black text-foreground">Acme Inc.</span>
            <span className="text-2xl font-black text-foreground">GlobalTech</span>
            <span className="text-2xl font-black text-foreground">NeuraLink</span>
            <span className="text-2xl font-black text-foreground">DevCorp</span>
          </div>
        </div>
      </main>
    </div>
  );
}
