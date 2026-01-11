"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

// Define the element layout locally or import from shared
interface CanvasElement {
    id: string
    type: "text" | "image" | "rect" | "circle"
    x: number
    y: number
    width: number
    height: number
    content?: string
    style: React.CSSProperties
}

function SlideViewer({ slide }: { slide: Slide }) {
    const [elements, setElements] = useState<CanvasElement[]>([])

    useEffect(() => {
        try {
            if (slide.content && slide.content.startsWith('[')) {
                setElements(JSON.parse(slide.content))
            } else {
                setElements([])
            }
        } catch (e) {
            console.error("Failed to parse", e)
        }
    }, [slide.content])

    return (
        <div
            className="w-full h-full flex items-center justify-center p-0 md:p-16 bg-black"
        >
            {/* Aspect Ratio Container */}
            <div
                className="aspect-video w-full max-w-6xl bg-white shadow-2xl relative overflow-hidden"
                style={{
                    backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                    backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {elements.map(el => (
                    <div
                        key={el.id}
                        style={{
                            position: 'absolute',
                            left: `${(el.x / 896) * 100}%`, // Convert px to % based on editor width (approx 896px if max-w-4xl)
                            top: `${(el.y / 504) * 100}%`, // approx height for 16:9 of 896px
                            // Actually, simply using px might be safer if we assume fixed resolution, 
                            // but for responsive presentation, we ideally scale. 
                            // For MVP, lets try to stick to pixels or use a scale transform on the container.
                        }}
                    >
                        {/* A better approach for the viewer: 
                             The Viewer Container should probably scale (transform: scale) to fit the screen window. 
                             The elements inside should keep their absolute px values relative to that container.
                         */}
                    </div>
                ))}

                {/* Re-render using simple pixels assuming the container is fixed size or we rely on scaling the viewbox */}
                {elements.map(el => (
                    <div
                        key={el.id}
                        style={{
                            position: 'absolute',
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            ...el.style,
                            border: 'none', // Remove dashed borders from text
                        }}
                        className="flex items-center justify-center overflow-hidden"
                    >
                        {el.type === 'text' && <div style={{ width: '100%', height: '100%', fontSize: el.style.fontSize, color: el.style.color, textAlign: el.style.textAlign as any }}>{el.content}</div>}
                        {el.type === 'image' && <img src={el.content || ''} className="w-full h-full object-cover" />}
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

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") nextSlide()
            if (e.key === "ArrowLeft") prevSlide()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentSlideIndex, presentation])

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!presentation) return <div className="h-screen flex items-center justify-center">Presentation not found</div>

    const currentSlide = presentation.slides[currentSlideIndex]

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative group flex items-center justify-center">
            {/* We scale this viewer to fit the screen content */}
            <div className="scale-[.8] md:scale-100 transform origin-center">
                <SlideViewer slide={currentSlide} />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-50">
                <div className="text-sm font-medium opacity-80 pl-4">{presentation.title}</div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={prevSlide} disabled={currentSlideIndex === 0} className="text-white hover:bg-white/20">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="text-sm">
                        {currentSlideIndex + 1} / {presentation.slides.length}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} className="text-white hover:bg-white/20">
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 pr-4">
                    {/* Edit button in new window */}
                    <Link href={`/editor/${presentation.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
