"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchPresentation, updatePresentationAction } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ArrowLeft, Save, Play, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SlideList } from "@/components/slide-editor/slide-list"
import { SlideCanvas, CanvasElement } from "@/components/slide-editor/slide-canvas"
import { SlideProperties } from "@/components/slide-editor/slide-properties"
import { useSlideEditor } from "@/components/slide-editor/use-slide-editor"
import { EditorToolbar } from "@/components/slide-editor/editor-toolbar"

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

    const handleSave = async (currentPresentation?: Presentation) => {
        const presToSave = currentPresentation || presentation
        if (!presToSave) return
        setSaving(true)
        try {
            await updatePresentationAction(presToSave)
            setPresentation(presToSave) // Update local state to match saved
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

    const activeSlide = presentation?.slides.find(s => s.id === activeSlideId) || null

    // Initialize Hook with Active Slide
    const {
        elements,
        selectedId,
        setSelectedId,
        zoom,
        setZoom,
        canUndo,
        canRedo,
        addElement,
        updateElementAndSave,
        removeElement,
        duplicateElement,
        handleArrange,
        handleClipboard,
        undo,
        redo,
        setElements
    } = useSlideEditor(activeSlide)

    // Sync elements changes back to presentation state to be ready for save
    // We strictly sync when 'elements' change from the hook
    // BEWARE: This might cause render loops if not careful.
    // 'elements' comes from 'activeSlide' initially.
    // When 'elements' changes in hook, we want to update 'activeSlide'.
    // We should only update if it is different.
    useEffect(() => {
        if (!activeSlide) return
        const currentContent = JSON.stringify(elements)
        if (currentContent !== activeSlide.content) {
            updateSlide(activeSlide.id, { content: currentContent })
        }
    }, [elements]) // eslint-disable-line react-hooks/exhaustive-deps

    // Keyboard shortcuts (Global)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                // If we have a selected element and NOT editing text (SlideCanvas handles editing state locally,
                // but we can check if document.activeElement is an input)
                const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
                const isContentEditable = (document.activeElement as HTMLElement)?.isContentEditable;

                if (selectedId && !isInput && !isContentEditable) {
                    removeElement(selectedId)
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault()
                undo()
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault()
                redo()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedId, removeElement, undo, redo])


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!presentation) return null

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 select-none z-10 relative">
                <div className="flex items-center gap-4">
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
                    <Button variant="ghost" size="sm" onClick={() => handleSave()} disabled={saving}>
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

            {/* Toolbar - Full Width */}
            <EditorToolbar
                selectedElement={elements.find(e => e.id === selectedId) || null}
                onAddElement={addElement}
                onUpdateElement={(updates) => selectedId && updateElementAndSave(selectedId, updates)}
                onDelete={() => selectedId && removeElement(selectedId)}
                onDuplicate={duplicateElement}
                onArrange={handleArrange}
                onClipboard={handleClipboard}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                zoom={zoom}
                onZoomChange={setZoom}
                aspectRatio={presentation.aspectRatio || '16:9'}
                onAspectRatioChange={(ratio) => setPresentation({ ...presentation, aspectRatio: ratio })}
                onAddSlide={addSlide}
            />

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
                <div className="flex-1 bg-muted/30 overflow-hidden flex flex-col relative z-0" onClick={() => setSelectedId(null)}>
                    {activeSlide && (
                        <SlideCanvas
                            slide={activeSlide}
                            elements={elements}
                            zoom={zoom}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onElementUpdate={updateElementAndSave}
                            onElementRemove={removeElement}
                            aspectRatio={presentation.aspectRatio}
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
                                selectedElement={elements.find(e => e.id === selectedId) || null}
                                onElementChange={(updates) => selectedId && updateElementAndSave(selectedId, updates)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
