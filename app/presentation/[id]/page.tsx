"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight, Edit, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { SlideTextEditor } from "@/components/slide-editor/slide-text-editor"
import { SlidePollElement } from "@/components/slide-editor/slide-poll-element"

// Duplicate interfaces from SlideCanvas to avoid circular deps or verify consistency
export interface CanvasElement {
    id: string
    type: "text" | "image" | "rect" | "circle" | "triangle" | "arrow" | "star" | "line" | "arrow-line" | "polygon" | "sine-wave" | "square-wave" | "tan-wave" | "poll" | "qr-code"
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
    const [elements, setElements] = useState<CanvasElement[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    // Parse elements
    useEffect(() => {
        try {
            if (slide.content && slide.content.startsWith('[')) {
                setElements(JSON.parse(slide.content))
            } else {
                setElements([])
            }
        } catch (e) {
            console.error("Failed to parse slide content", e)
            setElements([])
        }
    }, [slide.content])

    // Calculate scaling to fit window
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const parent = containerRef.current.parentElement
            if (!parent) return

            const parentWidth = parent.clientWidth
            const parentHeight = parent.clientHeight

            // Base dimensions (Internal coordinate system)
            const baseWidth = 1000
            const [w, h] = aspectRatio.split(':').map(Number)
            const baseHeight = (baseWidth * h) / w

            const scaleX = parentWidth / baseWidth
            const scaleY = parentHeight / baseHeight

            // Fit containment
            const calculatedScale = Math.min(scaleX, scaleY) * 0.95
            // console.log("Calculated Scale:", calculatedScale, "Parent:", parentWidth, parentHeight)
            setScale(calculatedScale)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Initial

        return () => window.removeEventListener('resize', handleResize)
    }, [aspectRatio])

    // console.log("Rendering SlideViewer. Elements:", elements.length, "Scale:", scale)

    // Base dimensions for style
    const baseWidth = 1000
    const [w, h] = aspectRatio.split(':').map(Number)
    const baseHeight = (baseWidth * h) / w

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
            <div
                style={{
                    width: baseWidth,
                    height: baseHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                    backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {elements.map(el => (
                    <div
                        key={el.id}
                        style={{
                            position: 'absolute',
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            zIndex: el.type === 'image' ? 0 : 1 // Simple z-index, ideally from data
                        }}
                    >
                        {/* Text Element (Use Read-Only Editor) */}
                        {el.type === 'text' && (
                            <SlideTextEditor
                                content={el.content || ''}
                                onChange={() => { }} // No-op
                                editable={false}
                                zoom={scale}
                                className="w-full h-full"
                                style={{
                                    fontSize: el.style.fontSize,
                                    color: el.style.color,
                                    textAlign: el.style?.textAlign as any,
                                    fontFamily: el.style.fontFamily as any,
                                }}
                            />
                        )}

                        {/* Image Element */}
                        {el.type === 'image' && (
                            <img
                                src={el.content || '/placeholder.png'}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        )}

                        {/* Poll Element (Interactive) */}
                        {el.type === 'poll' && (
                            <SlidePollElement
                                pollId={(() => { try { return JSON.parse(el.content || '{}').pollId || '' } catch { return '' } })()}
                                title={(() => { try { return JSON.parse(el.content || '{}').title || '' } catch { return '' } })()}
                            />
                        )}

                        {/* QR Code Element */}
                        {el.type === 'qr-code' && (
                            <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 gap-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scan to Vote</div>
                                <img
                                    src={(() => { try { return JSON.parse(el.content || '{}').qrUrl } catch { return '' } })()}
                                    className="w-[85%] h-auto aspect-square object-contain"
                                    alt="QR Code"
                                />
                                <div className="mt-2 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {(() => { try { return `Code: ${JSON.parse(el.content || '{}').shortCode}` } catch { return '' } })()}
                                </div>
                            </div>
                        )}

                        {/* Shapes (SVG Rendering) */}
                        {['rect', 'circle', 'triangle', 'arrow', 'star', 'polygon', 'line', 'arrow-line', 'sine-wave', 'square-wave', 'tan-wave'].includes(el.type) && (
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                                <g
                                    fill={el.style.backgroundColor?.toString() || 'none'}
                                    stroke={el.style.borderColor?.toString() || (el.style as any).stroke || 'none'}
                                    strokeWidth={
                                        (el.style as any).strokeWidth !== undefined ? (el.style as any).strokeWidth :
                                            el.style.borderWidth !== undefined ? parseInt(el.style.borderWidth.toString()) :
                                                0
                                    }
                                    strokeDasharray={
                                        el.style.borderStyle === 'dashed' ? '10,10' :
                                            el.style.borderStyle === 'dotted' ? '2,4' :
                                                'none'
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {el.type === 'rect' && <rect x="5" y="5" width="90" height="90" rx={el.style.borderRadius?.toString() === '50%' ? '45' : '0'} />}
                                    {el.type === 'circle' && <circle cx="50" cy="50" r="45" />}
                                    {el.type === 'triangle' && <polygon points="50,5 95,95 5,95" />}
                                    {el.type === 'star' && <polygon points="50,5 61,39 95,39 67,61 78,95 50,73 22,95 33,61 5,39 39,39" />}
                                    {el.type === 'polygon' && <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />}
                                    {el.type === 'arrow' && <polygon points="5,40 60,40 60,10 95,50 60,90 60,60 5,60" />}
                                    {el.type === 'line' && <line x1="0" y1="50" x2="100" y2="50" />}
                                    {el.type === 'arrow-line' && (
                                        <g>
                                            <line x1="0" y1="50" x2="100" y2="50" />
                                            <polygon points="90,40 100,50 90,60" fill="currentColor" stroke="none" />
                                        </g>
                                    )}
                                    {el.type === 'sine-wave' && (
                                        <path d="M 0 50 C 12.5 0, 12.5 0, 25 50 C 37.5 100, 37.5 100, 50 50 C 62.5 0, 62.5 0, 75 50 C 87.5 100, 87.5 100, 100 50" fill="none" />
                                    )}
                                    {el.type === 'square-wave' && (
                                        <path d="M 0 50 L 0 10 L 25 10 L 25 90 L 50 90 L 50 10 L 75 10 L 75 90 L 100 90 L 100 50" fill="none" />
                                    )}
                                    {el.type === 'tan-wave' && (
                                        <path d="M 0 100 Q 20 0, 40 100 T 80 100 T 120 100" fill="none" />
                                    )}
                                </g>
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function PresentationPage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [fullScreen, setFullScreen] = useState(false)

    useEffect(() => {
        loadPresentation()
    }, [params.id])

    async function loadPresentation() {
        if (!params.id) return
        try {
            const data = await fetchPresentation(params.id as string)
            setPresentation(data || null)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

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
                    <span className="text-xs text-white/60">
                        Slide {currentSlideIndex + 1} of {presentation.slides.length}
                    </span>
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
