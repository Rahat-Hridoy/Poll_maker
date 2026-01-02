import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-10 md:py-20">
      {/* Hero Section */}
      <section className="container max-w-4xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-balance">
          Create Instant Polls with <span className="text-primary">Real-time</span> Insights
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground text-lg md:text-xl">
          The simplest way to gather feedback. create custom polls, share with a link, and analyze results instantly. No sign-up required (for now).
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/admin/create">
            <Button size="lg" className="h-12 px-8 text-base">
              Create a Poll <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Manage Polls
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container max-w-5xl grid gap-8 md:grid-cols-3">
        <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-3 bg-primary/10 rounded-full">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Share Instantly</h3>
          <p className="text-muted-foreground">
            Generate a unique link for your poll and share it anywhere. Viewers can vote immediately.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-3 bg-primary/10 rounded-full">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Real-time Analytics</h3>
          <p className="text-muted-foreground">
            Watch votes come in real-time. Visualize data with beautiful interactive charts.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-3 bg-primary/10 rounded-full">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Complete Control</h3>
          <p className="text-muted-foreground">
            Edit your polls, manage visibility, and track visitor interactions effortlessly.
          </p>
        </div>
      </section>
    </div>
  );
}
