'use client'

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation" // Fixed import
import { fetchPresentation, updateSlideStateAction, updatePresentationStateAction, updatePresenterStateAction, resetSlideResultsAction } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideRenderer } from "@/components/slide-editor/slide-renderer"
import { PresenterControls } from "@/components/presentation/presenter-controls"

interface SlideViewerProps {
    slide: Slide
    aspectRatio?: string
    runtimeData?: any
}

function SlideViewer({ slide, aspectRatio = "16:9", runtimeData }: SlideViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [dims, setDims] = useState({ width: 1000, height: 562.5 })

    const baseWidth = 1000

    useEffect(() => {
        const [w, h] = aspectRatio.split(':').map(Number)
        const baseHeight = (baseWidth * h) / w
        setDims({ width: baseWidth, height: baseHeight })

        const handleResize = () => {
            if (!containerRef.current) return
            const parent = containerRef.current
            const parentWidth = parent.clientWidth
            const parentHeight = parent.clientHeight

            const scaleX = parentWidth / baseWidth
            const scaleY = parentHeight / baseHeight

            const calculatedScale = Math.min(scaleX, scaleY) * 0.95 // 95% to leave some margin
            setScale(calculatedScale)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [aspectRatio])

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative bg-black/50">
             {/* Slide Container */}
             <div 
                style={{
                    width: dims.width,
                    height: dims.height,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center"
                 }}
                className="shadow-2xl bg-white overflow-hidden"
             >
                 <SlideRenderer 
                    slide={slide} 
                    scale={1} // Renderer handles its own internal stuff, but scaling is done via CSS transform here for the whole block
                    width={dims.width}
                    height={dims.height}
                    interactive={true} // Presenter can interact
                    runtimeData={runtimeData}
                 />
             </div>
        </div>
    )
}

export default function PresentationPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    const initialSlideParam = searchParams.get('slide')
    const initialIndex = initialSlideParam ? parseInt(initialSlideParam, 10) : 0

    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIndex)
    const [loading, setLoading] = useState(true)
    const [fullScreen, setFullScreen] = useState(false)

    useEffect(() => {
        loadPresentation()
    }, [params?.id])

    // Sync current slide with server for audience
    useEffect(() => {
        if (params?.id) {
            updatePresenterStateAction(params.id as string, currentSlideIndex)
        }
    }, [currentSlideIndex, params?.id])

    async function loadPresentation() {
        if (!params?.id) return
        try {
            const data = await fetchPresentation(params.id as string)
            if (data) {
                setPresentation(prev => {
                    if (!prev) return data
                    // Only update if something changed to avoid jitter, though naive check
                    if (data.updatedAt !== prev.updatedAt) return data
                    return prev
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Auto-refresh logic (Polling) - could be replaced by realtime socket
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadPresentation() // Keep syncing to get latest Votes etc.
            }
        }, 2000)
        return () => clearInterval(interval)
    }, [params?.id])

    const nextSlide = () => {
        if (!presentation) return
        let nextIndex = currentSlideIndex + 1
        // Skip hidden slides if necessary, or show them with an indicator? Usually presenters see everything.
        // Let's just go next.
        if (nextIndex < presentation.slides.length) {
            setCurrentSlideIndex(nextIndex)
        }
    }

    const prevSlide = () => {
        if (!presentation) return
        let prevIndex = currentSlideIndex - 1
        if (prevIndex >= 0) {
            setCurrentSlideIndex(prevIndex)
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

    // State Update Handlers
    const handleUpdateSlideState = async (slideId: string, updates: Partial<Slide>) => {
        if (!presentation) return
        
        // Optimistic update locally
        const updatedSlides = presentation.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
        setPresentation({ ...presentation, slides: updatedSlides })
        
        await updateSlideStateAction(presentation.id, slideId, updates)
    }

    const handleUpdatePresentationState = async (presentationId: string, updates: Partial<Presentation>) => {
        if (!presentation) return
        
        setPresentation({ ...presentation, ...updates })
        await updatePresentationStateAction(presentation.id, updates)
    }
    
    const handleResetSlideResults = async (slideId: string) => {
        if (!presentation) return
        await resetSlideResultsAction(presentation.id, slideId)
        // Refresh data
        loadPresentation()
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
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
            
            {/* Top-Left Floating Presenter Controls */}
            <PresenterControls 
                presentation={presentation}
                currentSlide={currentSlide}
                onUpdateSlideState={handleUpdateSlideState}
                onUpdatePresentationState={handleUpdatePresentationState}
                onResetSlideResults={handleResetSlideResults}
                activeAudienceCount={presentation.visitors || 0}
            />

            {/* Main Slide View */}
            <div className="w-full h-full flex items-center justify-center relative">
                <SlideViewer
                    slide={currentSlide}
                    aspectRatio={presentation.aspectRatio}
                    runtimeData={{
                        questions: presentation.qaSessions?.[currentSlide.id] || []
                    }}
                />
            </div>

            {/* Centralized Bottom Navigation Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl transition-opacity duration-300 hover:opacity-100 opacity-90">
                
                {/* Navigation */}
                <div className="flex items-center gap-2 pl-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={prevSlide} 
                        disabled={currentSlideIndex === 0} 
                        className="text-white hover:bg-white/10 rounded-full h-10 w-10 disabled:opacity-30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    
                    <span className="text-sm font-bold font-mono min-w-[6ch] text-center text-slate-200">
                        {currentSlideIndex + 1} / {presentation.slides.length}
                    </span>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={nextSlide} 
                        disabled={currentSlideIndex === presentation.slides.length - 1} 
                        className="text-white hover:bg-white/10 rounded-full h-10 w-10 disabled:opacity-30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Tools */}
                <div className="flex items-center gap-1 pr-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleFullScreen} 
                        className="text-white hover:bg-white/10 rounded-full h-10 w-10"
                        title="Toggle Fullscreen (f)"
                    >
                        {fullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Join Code (Conditional Display in Bar?) - Let's keep it separate or integrating small here */}
                {presentation.showJoiningCode && (
                     <>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="pr-4 pl-1 flex flex-col leading-none">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Join Code</span>
                            <span className="text-lg font-mono font-bold text-white tracking-widest">{presentation.shortCode}</span>
                        </div>
                     </>
                )}

            </div>
        </div>
    )
}
