"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { POLL_TEMPLATES } from "@/lib/data"

export default function TemplateSelectionPage({ searchParams }: { searchParams: { type?: string } }) {
    const router = useRouter()
    const type = searchParams?.type || 'poll'

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-5xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Create a new {type === 'quiz' ? 'Quiz' : 'Poll'}</h1>
                    <p className="text-muted-foreground">Choose a template to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {POLL_TEMPLATES.map((template) => (
                        <Card
                            key={template.name}
                            className="group cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
                            onClick={() => router.push(`/create/editor?template=${encodeURIComponent(template.name)}&type=${type}`)}
                        >
                            <CardContent className="p-6 flex flex-col items-center gap-6">
                                <div className="w-full aspect-[4/3] rounded-lg border shadow-sm flex items-center justify-center relative overflow-hidden" style={{
                                    backgroundColor: template.style.backgroundColor,
                                    color: template.style.textColor,
                                    fontFamily: template.style.fontFamily
                                }}>
                                    <div className="absolute top-4 left-4 w-12 h-2 rounded bg-current opacity-20" />
                                    <div className="absolute top-8 left-4 w-20 h-2 rounded bg-current opacity-20" />

                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl font-bold opacity-20">
                                        +
                                    </div>

                                    {/* Mock styling elements */}
                                    <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full" style={{ backgroundColor: template.style.primaryColor }} />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {template.name === "Blank Canvas" ? "Start from scratch" : "Pre-styled template"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-between pt-12">
                    <Link href="/">
                        <Button variant="outline" size="lg" className="rounded-full px-8">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                    {/* Next button is redundant as card click handles it, but kept for wireframe fidelity if needed. 
                        Wireframe shows "Next" but selecting a card is more intuitive. 
                        I'll leave it as a visual cue or disabled until selection if state was local. 
                        For now, card click is cleaner.
                    */}
                </div>
            </div>
        </div>
    )
}
