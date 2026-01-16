"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchPresentation, updatePresentationAction } from "@/app/actions/presentation"
import { Presentation, Slide } from "@/lib/data"
import { Loader2, ArrowLeft, Save, Play, ChevronLeft, Download, Share2, Presentation as PresentIcon, FileText, MonitorPlay, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToPDF, exportToPPTX } from "@/lib/export-utils"
import { SlideList } from "@/components/slide-editor/slide-list"
import { SlideCanvas, CanvasElement } from "@/components/slide-editor/slide-canvas"
import { SlideProperties } from "@/components/slide-editor/slide-properties"
import { useSlideEditor } from "@/components/slide-editor/use-slide-editor"
import { EditorToolbar } from "@/components/slide-editor/editor-toolbar"
import { SharePresentationDialog } from "@/components/presentation/share-presentation-dialog"
import { PreviewDialog } from "@/components/slide-editor/preview-dialog"

export default function SlideEditorPage() {
    const params = useParams()
    const router = useRouter()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [activeSlideId, setActiveSlideId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [leftOpen, setLeftOpen] = useState(true)
    const [rightOpen, setRightOpen] = useState(true)
    const [shareOpen, setShareOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)

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
            const updated = { ...presToSave, updatedAt: new Date().toISOString() }
            await updatePresentationAction(updated)
            setPresentation(updated) // Update local state to match saved
        } catch (error) {
            console.error("Failed to save", error)
        } finally {
            setSaving(false)
        }
    }

    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const triggerAutoSave = (updatedPresentation: Presentation) => {
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)

        autoSaveTimeoutRef.current = setTimeout(() => {

            handleSave(updatedPresentation)
        }, 2000)
    }

    // Poll for updates (e.g. votes) if not editing
    useEffect(() => {
        const interval = setInterval(async () => {
            // Don't poll if we are actively saving or have pending changes
            if (saving || autoSaveTimeoutRef.current) return

            if (!params.id) return

            try {
                const data = await fetchPresentation(params.id as string)
                if (data) {
                    setPresentation(prev => {
                        // Only update if server has newer data
                        if (!prev || data.updatedAt !== prev.updatedAt) {
                            return data
                        }
                        return prev
                    })
                }
            } catch (e) {
                console.error("Polling failed", e)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [params.id, saving])

    const updateSlide = (slideId: string, updates: Partial<Slide>) => {
        if (!presentation) return
        const newSlides = presentation.slides.map(slide =>
            slide.id === slideId ? { ...slide, ...updates } : slide
        )
        const updatedPresentation = { ...presentation, slides: newSlides }
        setPresentation(updatedPresentation)

        // Trigger auto-save whenever slide is updated (content, background, etc)
        triggerAutoSave(updatedPresentation)
    }

    const addSlide = (type: 'blank' | 'poll' | 'quiz' | 'qa' = 'blank') => {
        if (!presentation) return

        let initialContent = '[]'

        // Helper to create full-screen template element
        const createTemplateElement = (elementType: any, contentObj: any) => ({
            id: crypto.randomUUID(),
            type: elementType,
            x: 0,
            y: 0,
            width: 1000, // These will be overridden by the locked logic in canvas but good to have defaults
            height: 562.5, // 16:9 roughly
            content: JSON.stringify(contentObj),
            rotation: 0,
            style: {
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '0px',
                padding: '0px',
                fontSize: '24px',
                color: '#0f172a'
            }
        })

        if (type === 'poll') {
            const pollElement = createTemplateElement('poll-template', {
                question: "Type your question here...",
                options: [
                    { id: "1", text: "Option 1", votes: 0, color: "#3b82f6" },
                    { id: "2", text: "Option 2", votes: 0, color: "#a855f7" }
                ]
            })
            initialContent = JSON.stringify([pollElement])
        } else if (type === 'quiz') {
            const quizElement = createTemplateElement('quiz-template', {
                question: "Type your quiz question here...",
                options: [
                    { id: "1", text: "Answer 1", isCorrect: false },
                    { id: "2", text: "Answer 2 (Correct)", isCorrect: true }
                ]
            })
            initialContent = JSON.stringify([quizElement])
        } else if (type === 'qa') {
            const qaElement = createTemplateElement('qa-template', {
                title: "Q&A Session",
                subtitle: "Ask your questions now! Scan the code or go to the link."
            })
            initialContent = JSON.stringify([qaElement])
        }

        const newSlide: Slide = {
            id: crypto.randomUUID(),
            content: initialContent,
            background: "#ffffff",
            layout: type
        }
        const updatedPresentation = {
            ...presentation,
            slides: [...presentation.slides, newSlide]
        }
        setPresentation(updatedPresentation)
        setActiveSlideId(newSlide.id)
        triggerAutoSave(updatedPresentation)
    }

    const removeSlide = (id: string) => {
        if (!presentation) return
        if (presentation.slides.length <= 1) {
            alert("Cannot delete the last slide")
            return
        }
        const newSlides = presentation.slides.filter(s => s.id !== id)
        const updatedPresentation = { ...presentation, slides: newSlides }
        setPresentation(updatedPresentation)
        if (activeSlideId === id) {
            setActiveSlideId(newSlides[0].id)
        }
        triggerAutoSave(updatedPresentation)
    }

    const reorderSlides = (newSlides: Slide[]) => {
        if (!presentation) return;
        const updatedPresentation = { ...presentation, slides: newSlides }
        setPresentation(updatedPresentation);
        triggerAutoSave(updatedPresentation)
    }

    const handleExportPDF = async () => {
        if (!presentation) return
        setExporting(true)
        try {
            await exportToPDF(presentation)
        } finally {
            setExporting(false)
        }
    }

    const handleExportPPTX = async () => {
        if (!presentation) return
        setExporting(true)
        try {
            await exportToPPTX(presentation)
        } finally {
            setExporting(false)
        }
    }

    const activeSlide = presentation?.slides.find(s => s.id === activeSlideId) || null
    const lastSlideIdRef = useRef<string | null>(null)

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
        addPollElement,
        addPollQRCode,
        undo,
        redo,
        setElements
    } = useSlideEditor(activeSlide)

    const lastSyncedContentRef = useRef<string | null>(null)
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Sync elements changes back to presentation state to be ready for save
    // Use debouncing to prevent infinite loops and improve performance during rapid updates
    useEffect(() => {
        if (!activeSlide) return

        // Skip sync if we are still switching slides
        if (lastSlideIdRef.current !== activeSlide.id) {
            lastSlideIdRef.current = activeSlide.id
            lastSyncedContentRef.current = activeSlide.content
            return
        }

        const currentContent = JSON.stringify(elements)

        // Only trigger update if content is actually different and not what we last synced
        if (currentContent !== activeSlide.content && currentContent !== lastSyncedContentRef.current) {

            // Clear existing timeout
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current)
            }

            // Debounce the update to the parent state
            syncTimeoutRef.current = setTimeout(() => {
                lastSyncedContentRef.current = currentContent
                updateSlide(activeSlide.id, { content: currentContent })
            }, 1000) // Increased to 1s to rely more on explicit saves or final debounce
        }

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current)
            }
        }
    }, [elements, activeSlide?.id, activeSlide?.content])

    // Manual Save Wrapper to ensure we save the LATEST elements state
    const handleSaveWithSync = async () => {
        if (!activeSlide) return

        // Force sync current elements before saving
        const currentContent = JSON.stringify(elements)

        if (currentContent !== activeSlide.content) {
            updateSlide(activeSlide.id, { content: currentContent })
            // We need to wait a tick for state to update or pass the updated presentation directly
            const updatedPresentation = {
                ...presentation!,
                slides: presentation!.slides.map(s => s.id === activeSlide.id ? { ...s, content: currentContent } : s)
            }
            await handleSave(updatedPresentation)
            return
        }

        await handleSave()
    }

    // Keyboard shortcuts (Global)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
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
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <input
                        className="bg-transparent font-semibold focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                        value={presentation.title}
                        onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                    />
                </div>

                {/* Centered Preview Button */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 shadow-sm"
                        onClick={() => setPreviewOpen(true)}
                    >
                        <Play className="w-3 h-3 fill-current" />
                        Preview
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="sm" className="gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleSaveWithSync()} disabled={saving || exporting}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPDF} disabled={saving || exporting}>
                                {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                                Save as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPPTX} disabled={saving || exporting}>
                                {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MonitorPlay className="w-4 h-4 mr-2" />}
                                Save as PPTX
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareOpen(true)}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>

                    <Link href={`/presentation/${presentation.id}?v=${Date.now()}`} target="_blank">
                        <Button variant="outline" size="sm" className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                            <PresentIcon className="w-4 h-4 mr-2" />
                            Present
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Toolbar - Full Width */}
            <EditorToolbar
                selectedElement={Array.isArray(elements) ? (elements.find(e => e.id === selectedId) || null) : null}
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
                onAspectRatioChange={(ratio) => {
                    const updatedPresentation = { ...presentation, aspectRatio: ratio }
                    setPresentation(updatedPresentation)
                    triggerAutoSave(updatedPresentation)
                }}
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
                            aspectRatio={presentation.aspectRatio}
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
                                selectedElement={Array.isArray(elements) ? (elements.find(e => e.id === selectedId) || null) : null}
                                onElementChange={(updates) => selectedId && updateElementAndSave(selectedId, updates)}
                                onAddPoll={addPollElement}
                                onAddQRCode={addPollQRCode}
                            />
                        )}
                    </div>
                </div>
            </div>
            {presentation && (
                <>
                    <SharePresentationDialog
                        open={shareOpen}
                        onOpenChange={setShareOpen}
                        url={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/view/${presentation.id}` : ''}
                        title={presentation.title}
                        shortCode={presentation.shortCode}
                    />
                    <PreviewDialog
                        open={previewOpen}
                        onOpenChange={setPreviewOpen}
                        presentationId={presentation.id}
                        title={presentation.title}
                    />
                </>
            )}
        </div>
    )
}
