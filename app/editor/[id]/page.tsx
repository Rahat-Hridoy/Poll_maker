"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchPresentation, updatePresentationAction } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ArrowLeft, Save, Play, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SlideList } from "@/components/slide-editor/slide-list"
import { SlideCanvas } from "@/components/slide-editor/slide-canvas"
import { SlideProperties } from "@/components/slide-editor/slide-properties"

export default function SlideEditorPage() {
    const params = useParams()
    const router = useRouter()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [activeSlideId, setActiveSlideId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [leftOpen, setLeftOpen] = useState(true)
    const [rightOpen, setRightOpen] = useState(true)

    useEffect(() => {
        loadPresentation()
    }, [params.id])

    async function loadPresentation() {
        if (!params.id) return
        try {
            const data = await fetchPresentation(params.id as string)
            if (data) {
                setPresentation(data)
                if (data.slides.length > 0) {
                    setActiveSlideId(data.slides[0].id)
                }
            } else {
                router.push("/admin/slides")
            }
        } catch (error) {
            console.error("Failed to load presentation", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!presentation) return
        setSaving(true)
        try {
            await updatePresentationAction(presentation)
        } catch (error) {
            console.error("Failed to save", error)
        } finally {
            setSaving(false)
        }
    }

    const updateSlide = (slideId: string, updates: Partial<Slide>) => {
        if (!presentation) return
        const newSlides = presentation.slides.map(slide =>
            slide.id === slideId ? { ...slide, ...updates } : slide
        )
        setPresentation({ ...presentation, slides: newSlides })
    }

    const addSlide = () => {
        if (!presentation) return
        const newSlide: Slide = {
            id: crypto.randomUUID(),
            content: '[]', // Empty JSON array for canvas elements
            background: "#ffffff",
            layout: 'blank'
        }
        setPresentation({
            ...presentation,
            slides: [...presentation.slides, newSlide]
        })
        setActiveSlideId(newSlide.id)
    }

    const removeSlide = (id: string) => {
        if (!presentation) return
        if (presentation.slides.length <= 1) {
            alert("Cannot delete the last slide")
            return
        }
        const newSlides = presentation.slides.filter(s => s.id !== id)
        setPresentation({ ...presentation, slides: newSlides })
        if (activeSlideId === id) {
            setActiveSlideId(newSlides[0].id)
        }
    }

    const reorderSlides = (newSlides: Slide[]) => {
        if (!presentation) return;
        setPresentation({ ...presentation, slides: newSlides });
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!presentation) return null

    const activeSlide = presentation.slides.find(s => s.id === activeSlideId)

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header / Toolbar */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 select-none">
                <div className="flex items-center gap-4">
                    {/* Back button removed as we are in a new window */}
                    {/* But maybe keep it to close tab? */}
                    <Link href="/admin/slides" className="text-muted-foreground hover:text-foreground">
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <input
                        className="bg-transparent font-semibold focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                        value={presentation.title}
                        onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                    <Link href={`/presentation/${presentation.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Present
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Slide List */}
                <div
                    className={`border-r bg-muted/10 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative ${leftOpen ? 'w-64' : 'w-0 border-r-0'}`}
                >
                    <div className={`w-64 h-full flex flex-col ${leftOpen ? 'opacity-100' : 'opacity-0'} transition-opacity overflow-hidden`}>
                        <SlideList
                            slides={presentation.slides}
                            activeSlideId={activeSlideId}
                            onSelect={setActiveSlideId}
                            onAdd={addSlide}
                            onDelete={removeSlide}
                            onReorder={reorderSlides}
                        />
                    </div>
                </div>

                {/* Left Toggle Button (Floating) */}
                <button
                    onClick={() => setLeftOpen(!leftOpen)}
                    className={`absolute top-1/2 -translate-y-1/2 z-20 bg-background border rounded-full p-1 shadow-md hover:bg-muted transition-all duration-300 ${leftOpen ? 'left-[244px]' : 'left-2'}`}
                    title={leftOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    <ChevronLeft className={`w-3 h-3 transition-transform ${leftOpen ? '' : 'rotate-180'}`} />
                </button>

                {/* Center Panel: Canvas */}
                <div className="flex-1 bg-muted/30 overflow-hidden flex flex-col relative z-0">
                    {activeSlide && (
                        <SlideCanvas
                            slide={activeSlide}
                            onChange={(updates) => updateSlide(activeSlide.id, updates)}
                            theme={presentation.theme}
                        />
                    )}
                </div>

                {/* Right Toggle Button (Floating) */}
                <button
                    onClick={() => setRightOpen(!rightOpen)}
                    className={`absolute top-1/2 -translate-y-1/2 z-20 bg-background border rounded-full p-1 shadow-md hover:bg-muted transition-all duration-300 ${rightOpen ? 'right-[276px]' : 'right-2'}`}
                    title={rightOpen ? "Collapse Properties" : "Expand Properties"}
                >
                    <ChevronLeft className={`w-3 h-3 transition-transform ${rightOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Right Panel: Properties */}
                <div
                    className={`border-l bg-card shrink-0 transition-all duration-300 ease-in-out relative ${rightOpen ? 'w-72' : 'w-0 border-l-0'}`}
                >
                    <div className={`w-72 h-full overflow-y-auto ${rightOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                        {activeSlide && (
                            <SlideProperties
                                slide={activeSlide}
                                onChange={(updates) => updateSlide(activeSlide.id, updates)}
                                presentationTheme={presentation.theme}
                                onThemeChange={(theme) => setPresentation({ ...presentation, theme })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
