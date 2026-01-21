"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { submitVoteAction } from "@/app/actions/audience"
import { submitQuestion } from "@/app/actions/qa"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight, Maximize2, Minimize2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideRenderer } from "@/components/slide-editor/slide-renderer"

interface SlideViewerProps {
    slide: Slide
    aspectRatio?: '16:9' | '4:3' | '1:1'
    onVote?: (optionId: string) => void
    hasVoted?: boolean
}

function SlideViewer({ slide, aspectRatio = '16:9', onVote, hasVoted }: SlideViewerProps) {
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
            <SlideRenderer
                slide={slide}
                scale={scale}
                interactive={true}
                height={baseHeight}
                onPollVote={onVote}
                hasVoted={hasVoted}
            />
        </div>
    )
}

function IdentityModal({ onJoin }: { onJoin: (name: string) => void }) {
    const [name, setName] = useState("")

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Join Presentation</h2>
                    <p className="text-slate-500">Please enter your name to participate</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Your Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onJoin(name)}
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        />
                    </div>
                    <Button
                        size="lg"
                        className="w-full text-lg h-12 rounded-xl"
                        disabled={!name.trim()}
                        onClick={() => onJoin(name)}
                    >
                        Join Now
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function UserViewPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    const initialSlideParam = searchParams.get('slide')
    const initialIndex = initialSlideParam ? parseInt(initialSlideParam, 10) : 0

    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex)
    const [loading, setLoading] = useState(true)
    const [fullScreen, setFullScreen] = useState(false)
    const [hasVotedMap, setHasVotedMap] = useState<Record<string, boolean>>({})
    const [userName, setUserName] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    // Q&A State
    const [questionText, setQuestionText] = useState("")
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
    const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedName = localStorage.getItem('poll_maker_username')
        if (storedName) setUserName(storedName)
    }, [])

    const handleJoin = (name: string) => {
        localStorage.setItem('poll_maker_username', name)
        setUserName(name)
    }

    // Poll for updates (sync with presenter)
    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            if (!params.id) return
            try {
                const data = await fetchPresentation(params.id as string)
                if (data && mounted) {
                    setPresentation(data)
                    // Auto-sync slide index from presenter
                    if (data.currentSlideIndex !== undefined) {
                        setCurrentSlideIndex(data.currentSlideIndex)
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadData() // Initial load
        const intervalId = setInterval(loadData, 1000)

        return () => {
            mounted = false
            clearInterval(intervalId)
        }
    }, [params.id])

    const nextSlide = () => {
        if (!presentation) return
        if (currentSlideIndex < presentation.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1)
            setHasSubmittedQuestion(false)
        }
    }

    const prevSlide = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1)
            setHasSubmittedQuestion(false)
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

    const handleVote = async (optionId: string) => {
        if (!presentation) return
        const currentSlide = presentation.slides[currentSlideIndex]
        if (!currentSlide) return

        // Optimistically set voted state
        setHasVotedMap(prev => ({ ...prev, [currentSlide.id]: true }))

        try {
            await submitVoteAction(presentation.id, currentSlide.id, optionId, userName || 'Anonymous')
            // No need to reload presentation immediately as we just want to show success state
        } catch (e) {
            console.error("Vote failed", e)
            // Revert on failure
            setHasVotedMap(prev => {
                const newMap = { ...prev }
                delete newMap[currentSlide.id]
                return newMap
            })
        }
    }

    const handleSubmitQuestion = async () => {
        if (!presentation || !questionText.trim()) return
        const currentSlide = presentation.slides[currentSlideIndex]
        if (!currentSlide) return

        setIsSubmittingQuestion(true)
        try {
             // If we don't have a user name, maybe use "Anonymous" or prompt? 
             // The live view allows anonymous.
             const result = await submitQuestion(presentation.id, currentSlide.id, questionText, userName || 'Anonymous')
             if (result.success) {
                 setQuestionText("")
                 setHasSubmittedQuestion(true)
             }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmittingQuestion(false)
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

    if (!userName && mounted) {
        return <IdentityModal onJoin={handleJoin} />
    }

    const currentSlide = presentation.slides[currentSlideIndex]
    
    // Check for Q&A content
    let isQA = false
    try {
        const content = JSON.parse(currentSlide.content || '[]')
        if (Array.isArray(content)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isQA = content.some((el: any) => el.type === 'qa-template')
        } else {
             // Fallback for legacy object structure
             isQA = content.type === 'qa-template'
        }
    } catch {}

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative group">
            {isQA && !loading ? (
                <div className="absolute inset-0 z-50 bg-white flex items-center justify-center p-6 text-slate-900">
                    <div className="w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-500">
                        {hasSubmittedQuestion ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Question Sent!</h3>
                                <p className="text-xl text-slate-500 mb-10 leading-relaxed">The presenter will see your question shortly.</p>
                                <Button 
                                    size="lg"
                                    onClick={() => setHasSubmittedQuestion(false)}
                                    className="w-full h-12 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02]"
                                >
                                    Ask Another Question
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="text-center mb-10">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Q&A Session</h3>
                                    <p className="text-slate-500 text-lg">Ask your question anonymously</p>
                                </div>
                                <div className="space-y-6">
                                    <textarea 
                                        placeholder="Type your question here..." 
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        className="w-full h-48 p-6 text-xl bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-black focus:ring-0 transition-all resize-none placeholder:text-slate-300 text-slate-900 shadow-inner"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <Button 
                                        size="lg"
                                        onClick={handleSubmitQuestion}
                                        disabled={!questionText.trim() || isSubmittingQuestion}
                                        className="w-full h-16 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 text-xl transition-all hover:scale-[1.02]"
                                    >
                                        {isSubmittingQuestion ? (
                                            <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                        ) : null}
                                        {isSubmittingQuestion ? "Sending..." : "Submit Question"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Minimal Nav Controls for Q&A */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                         <div className="flex items-center gap-4 bg-slate-100/50 backdrop-blur-md p-2 rounded-full border border-slate-200 shadow-sm">
                            <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlideIndex === 0} className="text-slate-600 hover:bg-white rounded-full h-10 w-10">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <span className="text-sm font-bold min-w-[3ch] text-center text-slate-600">
                                {currentSlideIndex + 1} / {presentation.slides.length}
                            </span>
                            <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="text-slate-600 hover:bg-white rounded-full h-10 w-10">
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <SlideViewer
                        slide={currentSlide}
                        aspectRatio={presentation.aspectRatio}
                        onVote={handleVote}
                        hasVoted={hasVotedMap[currentSlide.id] || false}
                    />

                    {/* Controls Overlay for Normal Slides */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between z-40 pointer-events-none">
                        <div className="pointer-events-auto flex flex-col gap-1">
                            <h1 className="text-lg font-bold drop-shadow-md leading-none">{presentation.title}</h1>
                            <div className="text-xs text-white/80 font-mono bg-black/20 px-2 py-1 rounded inline-block w-fit mt-1 border border-white/10">
                                Guest View
                            </div>
                        </div>

                        <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                            <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlideIndex === 0} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <span className="text-sm font-bold min-w-[3ch] text-center">
                                {currentSlideIndex + 1} / {presentation.slides.length}
                            </span>
                            <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="pointer-events-auto flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="text-white hover:bg-white/20 rounded-full h-10 w-10">
                                {fullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
