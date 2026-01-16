"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight, Edit, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

import { SlideRenderer } from "@/components/slide-editor/slide-renderer"
import { updatePresenterStateAction } from "@/app/actions/audience"

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
    const searchParams = useSearchParams()

    // Get initial slide index from URL or default to 0
    // We do this lazily or in effect, but state initialization is cleaner if possible.
    // However, searchParams might not be ready immediately in some Next.js versions/configs, but usually fine in client comp.
    const initialSlideParam = searchParams.get('slide')
    const initialIndex = initialSlideParam ? parseInt(initialSlideParam, 10) : 0

    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex)
    const [loading, setLoading] = useState(true)
    const [fullScreen, setFullScreen] = useState(false)


    useEffect(() => {
        loadPresentation()
    }, [params.id])

    // Sync current slide with server for audience
    useEffect(() => {
        if (params.id) {
            updatePresenterStateAction(params.id as string, currentSlideIndex)
        }
    }, [currentSlideIndex, params.id])



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
