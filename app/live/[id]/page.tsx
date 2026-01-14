'use client'

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { submitVoteAction } from "@/app/actions/audience"
import { Presentation } from "@/lib/data"
import { Loader2, Vote, BarChart3, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideRenderer } from "@/components/slide-editor/slide-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function LiveAudiencePage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pollData, setPollData] = useState<any>(null)
    const [scale, setScale] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVoteOpen, setIsVoteOpen] = useState(false)

    const presentationId = params.id as string

    // Polling for updates
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchPresentation(presentationId)
            if (data) {
                setPresentation(data)

                // Check if current slide has a poll
                const currentSlide = data.slides[data.currentSlideIndex || 0]
                if (currentSlide) {
                    try {
                        const elements = JSON.parse(currentSlide.content)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pollEl = elements.find((el: any) => el.type === 'poll-template')
                        if (pollEl) {
                            const parsedPollData = JSON.parse(pollEl.content)
                            // Only update if question changed to avoid glitching
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setPollData((prev: any) => {
                                if (prev?.question !== parsedPollData.question) {
                                    setHasVoted(false) // Reset vote state for new poll
                                    return parsedPollData
                                }
                                return prev
                            })
                        } else {
                            setPollData(null)
                            setIsVoteOpen(false)
                        }
                    } catch {
                        setPollData(null)
                    }
                }
            }
            setLoading(false)
        }

        loadData() // Initial load
        const intervalId = setInterval(loadData, 1000)

        return () => clearInterval(intervalId)
    }, [presentationId])

    // Calculate scaling to fit window
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const parent = containerRef.current

            const parentWidth = parent.clientWidth
            const parentHeight = parent.clientHeight

            // Base dimensions
            const baseWidth = 1000
            const [w, h] = (presentation?.aspectRatio || '16:9').split(':').map(Number)
            const baseHeight = (baseWidth * h) / w

            const scaleX = parentWidth / baseWidth
            const scaleY = parentHeight / baseHeight

            const calculatedScale = Math.min(scaleX, scaleY) * 0.95
            setScale(calculatedScale)
        }

        window.addEventListener('resize', handleResize)
        if (presentation) handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [presentation])

    const handleVote = async (optionId: string) => {
        if (!presentation || !presentation.slides[presentation.currentSlideIndex || 0]) return

        setVoting(true)
        const slideId = presentation.slides[presentation.currentSlideIndex || 0].id

        try {
            const result = await submitVoteAction(presentationId, slideId, optionId)
            if (result.success) {
                setHasVoted(true)
                setTimeout(() => {
                    setIsVoteOpen(false) // Close modal after delay
                }, 2000)
            }
        } catch (e) {
            console.error("Vote failed", e)
        } finally {
            setVoting(false)
        }
    }

    if (loading && !presentation) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>
    }

    if (!presentation) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Presentation not found</div>
    }

    return (
        <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden">
            {/* Live Presentation View */}
            <div ref={containerRef} className="flex-1 w-full flex items-center justify-center">
                <SlideRenderer
                    slide={presentation.slides[presentation.currentSlideIndex || 0]}
                    scale={scale}
                    interactive={false} // Audience just watches, votes via button
                />
            </div>

            {/* Header / Status Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/60 to-transparent flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-bold text-sm tracking-widest">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Voting FAB */}
            {pollData && (
                <div className="absolute top-4 right-4 z-50">
                    <Dialog open={isVoteOpen} onOpenChange={setIsVoteOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="rounded-full h-14 px-6 shadow-xl bg-blue-600 hover:bg-blue-500 text-white font-bold animate-bounce"
                            >
                                <Vote className="mr-2 h-5 w-5" />
                                Vote Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-none">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Cast Your Vote
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-4">
                                <h3 className="text-lg font-medium mb-4">{pollData.question}</h3>
                                <div className="space-y-3">
                                    {hasVoted ? (
                                        <div className="text-center py-8 bg-green-50 rounded-xl">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                            <p className="font-bold text-slate-800">Vote Submitted!</p>
                                        </div>
                                    ) : (
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        pollData.options.map((opt: any) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleVote(opt.id)}
                                                disabled={voting}
                                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium flex justify-between items-center group"
                                            >
                                                {opt.text}
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-500" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )
}
