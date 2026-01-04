import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-10 md:py-20">
      {/* Hero Section */}
      <section className="container max-w-4xl text-center space-y-6 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-7xl text-balance">
          Create Instant <span className="gradient-text">Polls</span> & <span className="gradient-text">Insights</span>
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl font-medium">
          The simplest way to gather feedback. Create custom polls, share with a link, and analyze results instantly.
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <Link href="/admin/create">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
              Create a Poll <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 backdrop-blur-sm">
              Manage Polls
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container max-w-6xl grid gap-8 md:grid-cols-3 px-4">
        {[
          { icon: Share2, title: "Share Instantly", desc: "Generate a unique link for your poll and share it anywhere. Viewers can vote immediately." },
          { icon: BarChart3, title: "Real-time Analytics", desc: "Watch votes come in real-time. Visualize data with beautiful interactive charts." },
          { icon: CheckCircle, title: "Complete Control", desc: "Edit your polls, manage visibility, and track visitor interactions effortlessly." }
        ].map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center p-8 space-y-4 rounded-2xl glass-card hover:bg-card/80 transition-all duration-300 hover:-translate-y-1">
            <div className={`p-4 rounded-full bg-linear-to-br ${i === 0 ? 'from-blue-500/10 to-purple-500/10' : i === 1 ? 'from-green-500/10 to-emerald-500/10' : 'from-orange-500/10 to-red-500/10'}`}>
              <feature.icon className={`h-10 w-10 ${i === 0 ? 'text-blue-500' : i === 1 ? 'text-green-500' : 'text-orange-500'}`} />
            </div>
            <h3 className="text-2xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
