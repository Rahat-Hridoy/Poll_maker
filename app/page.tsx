import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Zap, Layout, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/40 to-teal-200/40 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">PollMaker</span>
        </div>
        <nav className="flex items-center gap-4">
          {/* Placeholder for future auth check if needed, or static buttons */}
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center py-12 md:py-20 relative z-10">

        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            New: AI-Powered Quiz Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Engage your audience with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">stunning polls</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
            Create professional, interactive polls and quizzes in seconds. tailored for creators, educators, and businesses.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {/* Create Poll Card */}
          <Link href="/create?type=poll" className="group">
            <div className="h-full relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:bg-white/80 group-hover:border-indigo-200/50">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Layout className="w-32 h-32 text-indigo-600" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Poll</h2>
                  <p className="text-slate-500 leading-relaxed">
                    Get instant feedback with real-time analytics. Perfect for meetings and social media.
                  </p>
                </div>
                <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Start Creating <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Create Quiz Card */}
          <Link href="/create?type=quiz" className="group">
            <div className="h-full relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:bg-white/80 group-hover:border-purple-200/50">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Zap className="w-32 h-32 text-purple-600" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Quiz <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Beta</span></h2>
                  <p className="text-slate-500 leading-relaxed">
                    Engage your audience with interactive challenges and gamified experiences.
                  </p>
                </div>
                <Button variant="ghost" className="p-0 hover:bg-transparent text-slate-400 group-hover:text-purple-600 transition-colors font-semibold">
                  Coming Soon
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer/Trust Section */}
        <div className="mt-20 pt-10 border-t border-slate-200 w-full max-w-6xl text-center">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">Trusted by organizations worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Logos - replacing Lucide icons with text for cleaner look */}
            <span className="text-xl font-bold text-slate-600">Acme Inc.</span>
            <span className="text-xl font-bold text-slate-600">GlobalTech</span>
            <span className="text-xl font-bold text-slate-600">NeuraLink</span>
            <span className="text-xl font-bold text-slate-600">DevCorp</span>
          </div>
        </div>
      </main>
    </div>
  );
}
