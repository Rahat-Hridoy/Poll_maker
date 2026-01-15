"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight, Edit, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

import { SlideRenderer } from "@/components/slide-editor/slide-renderer"
import { updatePresenterStateAction, submitVoteAction } from "@/app/actions/audience"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3, CheckCircle2, Vote } from "lucide-react"

// Duplicate interfaces from SlideCanvas to avoid circular deps or verify consistency
export interface CanvasElement {
    id: string
    type: "text" | "image" | "rect" | "circle" | "triangle" | "arrow" | "star" | "line" | "arrow-line" | "polygon" | "sine-wave" | "square-wave" | "tan-wave" | "poll" | "qr-code" | "poll-template" | "quiz-template" | "qa-template"
    x: number
    y: number
    width: number
    height: number
    content?: string
    style: React.CSSProperties
    rotation?: number
}

interface SlideViewerProps {
    slide: Slide
    aspectRatio?: '16:9' | '4:3' | '1:1'
}

function SlideViewer({ slide, aspectRatio = '16:9' }: SlideViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    // Base dimensions
    const baseWidth = 1000
    const [w, h] = aspectRatio.split(':').map(Number)
    const baseHeight = (baseWidth * h) / w

    // Calculate scaling to fit window
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const parent = containerRef.current.parentElement
            if (!parent) return

            const parentWidth = parent.clientWidth
            const parentHeight = parent.clientHeight

            const scaleX = parentWidth / baseWidth
            const scaleY = parentHeight / baseHeight

            // Fit containment
            const calculatedScale = Math.min(scaleX, scaleY) * 0.95
            setScale(calculatedScale)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Initial

        return () => window.removeEventListener('resize', handleResize)
    }, [aspectRatio, baseHeight])

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
            <SlideRenderer slide={slide} scale={scale} interactive={true} height={baseHeight} />
        </div>
    )
}

export default function PresentationPage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [fullScreen, setFullScreen] = useState(false)
    const [isVoteOpen, setIsVoteOpen] = useState(false)
    const [voting, setVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pollData, setPollData] = useState<any>(null)

    useEffect(() => {
        loadPresentation()
    }, [params.id])

    // Sync current slide with server for audience
    useEffect(() => {
        if (params.id) {
            updatePresenterStateAction(params.id as string, currentSlideIndex)
        }
    }, [currentSlideIndex, params.id])

    // Extract poll data for voting UI
    useEffect(() => {
        if (presentation) {
            const currentSlide = presentation.slides[currentSlideIndex]
            if (currentSlide) {
                try {
                    const elements = JSON.parse(currentSlide.content)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const pollEl = elements.find((el: any) => el.type === 'poll-template')
                    if (pollEl) {
                        const parsedPollData = JSON.parse(pollEl.content)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setPollData((prev: any) => {
                            if (prev?.question !== parsedPollData.question) {
                                setHasVoted(false)
                                return parsedPollData
                            }
                            return prev
                        })
                    } else {
                        setPollData(null)
                    }
                } catch {
                    setPollData(null)
                }
            }
        }
    }, [presentation, currentSlideIndex])

    const handleVote = async (optionId: string) => {
        if (!presentation || !presentation.slides[currentSlideIndex]) return

        setVoting(true)
        const slideId = presentation.slides[currentSlideIndex].id

        try {
            const result = await submitVoteAction(params.id as string, slideId, optionId)
            if (result.success) {
                setHasVoted(true)
                setTimeout(() => {
                    setIsVoteOpen(false)
                }, 2000)
                // Refresh presentation data to show new results instantly
                loadPresentation()
            }
        } catch (e) {
            console.error("Vote failed", e)
        } finally {
            setVoting(false)
        }
    }

    async function loadPresentation() {
        if (!params.id) return
        try {
            const data = await fetchPresentation(params.id as string)
            if (data) {
                // If we already have a presentation, only update if the new data is actually newer
                setPresentation(prev => {
                    if (!prev) return data
                    if (data.updatedAt !== prev.updatedAt) {
                        return data
                    }
                    return prev
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Auto-refresh logic to keep presentation in sync
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadPresentation()
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [params.id])

    const nextSlide = () => {
        if (!presentation) return
        if (currentSlideIndex < presentation.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1)
        }
    }

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1)
        }
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setFullScreen(true)
        } else {
            document.exitFullscreen()
            setFullScreen(false)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") nextSlide()
            if (e.key === "ArrowLeft" || e.key === "PageUp") prevSlide()
            if (e.key === "f") toggleFullScreen()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentSlideIndex, presentation])

    if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>
    if (!presentation) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Presentation not found</div>

    const currentSlide = presentation.slides[currentSlideIndex]

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative group">
            <SlideViewer
                slide={currentSlide}
                aspectRatio={presentation.aspectRatio}
            />

            {/* Top Right Vote Button */}
            {pollData && (
                <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                    <Dialog open={isVoteOpen} onOpenChange={setIsVoteOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold animate-bounce shadow-xl h-14 px-6 gap-2"
                            >
                                <Vote className="w-5 h-5" />
                                Vote Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-none z-50">
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

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between z-50 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-1">
                    <h1 className="text-lg font-bold drop-shadow-md leading-none">{presentation.title}</h1>
                    <div className="text-xs text-white/80 font-mono bg-black/20 px-2 py-1 rounded inline-block w-fit mt-1 border border-white/10">
                        Join: <span className="text-blue-300 font-bold">/join</span> Code: <span className="text-white font-bold tracking-widest">{presentation.shortCode}</span>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">

                    <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlideIndex === 0} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="text-sm font-bold min-w-[3ch] text-center">
                        {currentSlideIndex + 1}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                        {fullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                    <Link href={`/editor/${presentation.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
