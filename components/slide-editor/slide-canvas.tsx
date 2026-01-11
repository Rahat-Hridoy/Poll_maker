"use client"

import { Slide } from "@/lib/data"
import { useState, useEffect } from "react"
import { Rnd } from "react-rnd"
import { Button } from "@/components/ui/button"
import { X, Maximize } from "lucide-react"
import { FloatingToolbar } from "./floating-toolbar"
import { SlideTextEditor } from "./slide-text-editor"

export type ElementType = "text" | "image" | "rect" | "circle" | "triangle" | "arrow" | "star"

export interface CanvasElement {
    id: string
    type: ElementType
    x: number
    y: number
    width: number
    height: number
    content?: string // For text or image URL
    style: React.CSSProperties
}

interface SlideCanvasProps {
    slide: Slide
    onChange: (updates: Partial<Slide>) => void
    theme: string
    selectedId: string | null
    onSelect: (id: string | null) => void
}

export function SlideCanvas({ slide, onChange, theme, selectedId, onSelect }: SlideCanvasProps) {
    const [elements, setElements] = useState<CanvasElement[]>([])
    const [clipboard, setClipboard] = useState<CanvasElement | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [history, setHistory] = useState<{ past: CanvasElement[][], future: CanvasElement[][] }>({ past: [], future: [] })
    const [zoom, setZoom] = useState(1)

    // Load elements from slide content
    useEffect(() => {
        try {
            if (slide.content && slide.content.startsWith('[')) {
                setElements(JSON.parse(slide.content))
            } else {
                // Backward compatibility or empty
                setElements([])
            }
        } catch (e) {
            console.error("Failed to parse slide content", e)
            setElements([])
        }
    }, [slide.id, slide.content])

    // Save elements when changed
    const updateElements = (newElements: CanvasElement[], saveHistory = true) => {
        if (saveHistory) {
            setHistory(prev => ({
                past: [...prev.past, elements],
                future: []
            }))
        }
        setElements(newElements)
        onChange({ content: JSON.stringify(newElements) })
    }

    const undo = () => {
        if (history.past.length === 0) return
        const previous = history.past[history.past.length - 1]
        const newPast = history.past.slice(0, -1)

        setHistory({
            past: newPast,
            future: [elements, ...history.future]
        })
        updateElements(previous, false)
    }

    const redo = () => {
        if (history.future.length === 0) return
        const next = history.future[0]
        const newFuture = history.future.slice(1)

        setHistory({
            past: [...history.past, elements],
            future: newFuture
        })
        updateElements(next, false)
    }

    const addElement = (type: ElementType) => {
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 300 : 150,
            height: type === 'text' ? 100 : 150,
            content: type === 'text' ? 'Double click to edit text...' : '',
            style: {
                backgroundColor: type === 'rect' ? '#3b82f6' : type === 'circle' ? '#ef4444' : 'transparent',
                borderRadius: type === 'circle' ? '50%' : '0px',
                border: type === 'text' ? '1px dashed rgba(0,0,0,0.2)' : 'none',
                fontSize: '24px',
                color: '#000000',
                borderWidth: '0px',
                borderColor: 'transparent',
                textAlign: 'left',
            }
        }
        updateElements([...elements, newEl])
        onSelect(newEl.id)
    }

    const removeElement = (id: string) => {
        const newElements = elements.filter(el => el.id !== id)
        updateElements(newElements)
        if (selectedId === id) onSelect(null)
    }

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
        )
        updateElements(newElements)
    }

    const duplicateElement = () => {
        if (!selectedId) return
        const el = elements.find(e => e.id === selectedId)
        if (!el) return

        const newEl: CanvasElement = {
            ...el,
            id: crypto.randomUUID(),
            x: el.x + 20,
            y: el.y + 20
        }
        updateElements([...elements, newEl])
        onSelect(newEl.id)
    }

    const handleArrange = (action: 'front' | 'back' | 'center-h' | 'center-v') => {
        if (!selectedId) return
        const elIndex = elements.findIndex(e => e.id === selectedId)
        if (elIndex === -1) return

        const newElements = [...elements]

        if (action === 'front') {
            const [el] = newElements.splice(elIndex, 1)
            newElements.push(el)
        } else if (action === 'back') {
            const [el] = newElements.splice(elIndex, 1)
            newElements.unshift(el)
        } else if (action === 'center-h') {
            // Assume canvas width ~ 1000px for now, typically we'd use a ref to get exact dimensions
            // But since elements are relative to the Container, centering relative to container width (e.g. 100%)
            // Let's assume standard slide width 960px or get from container
            newElements[elIndex].x = (960 - newElements[elIndex].width) / 2
        } else if (action === 'center-v') {
            newElements[elIndex].y = (540 - newElements[elIndex].height) / 2
        }

        updateElements(newElements)
    }

    const handleClipboard = (action: 'copy' | 'paste' | 'cut') => {
        if (action === 'copy' || action === 'cut') {
            if (!selectedId) return
            const el = elements.find(e => e.id === selectedId)
            if (el) {
                setClipboard(el)
                if (action === 'cut') {
                    removeElement(selectedId)
                }
            }
        } else if (action === 'paste') {
            if (!clipboard) return
            const newEl: CanvasElement = {
                ...clipboard,
                id: crypto.randomUUID(),
                x: clipboard.x + 20,
                y: clipboard.y + 20
            }
            updateElements([...elements, newEl])
            onSelect(newEl.id)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId && !editingId) {
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
    }, [selectedId, editingId, undo, redo, removeElement])

    return (
        <div className="flex-1 flex flex-col items-center justify-start py-4 px-4 overflow-hidden bg-muted/30 relative select-none">

            {/* Context Toolbar for Text */}
            {/* Context Toolbar for Text is now handled internally by SlideTextEditor via BubbleMenu */}
            {/* We remove the external rendering to avoid type errors and conflicts */}

            {/* Floating Toolbar */}
            <FloatingToolbar
                selectedElement={elements.find(e => e.id === selectedId) || null}
                onAddElement={addElement}
                onUpdateElement={(updates) => selectedId && updateElement(selectedId, updates)}
                onDelete={() => selectedId && removeElement(selectedId)}
                onDuplicate={duplicateElement}
                onArrange={handleArrange}
                onClipboard={handleClipboard}
                onUndo={undo}
                onRedo={redo}
                canUndo={history.past.length > 0}
                canRedo={history.future.length > 0}
                zoom={zoom}
                onZoomChange={setZoom}
            />

            {/* The "Paper" / Slide - Adjusted Aspect Ratio/Size */}
            <div
                className="aspect-video h-[90vh] bg-white shadow-2xl rounded-sm overflow-hidden relative transition-all duration-300 ease-in-out border border-border/40"
                style={{
                    backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                    backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                    backgroundPosition: 'center',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    width: 'auto',
                    // height is set by class 'h-[90vh]', aspect ratio drives width.
                }}
                onClick={() => {
                    onSelect(null)
                    setEditingId(null)
                }}
            >
                {elements.map(el => (
                    <Rnd
                        key={el.id}
                        size={{ width: el.width, height: el.height }}
                        position={{ x: el.x, y: el.y }}
                        onDragStop={(e, d) => {
                            if (editingId === el.id) return
                            updateElement(el.id, { x: d.x, y: d.y })
                        }}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            if (editingId === el.id) return
                            updateElement(el.id, {
                                width: parseInt(ref.style.width),
                                height: parseInt(ref.style.height),
                                ...position,
                            })
                        }}
                        disableDragging={editingId === el.id}
                        enableResizing={editingId !== el.id}
                        bounds="parent"
                        className={`group ${selectedId === el.id ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-500/30'}`}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            // Only select if not already editing another element
                            if (editingId !== el.id) {
                                onSelect(el.id)
                            }
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation()
                            if (el.type === 'text') {
                                setEditingId(el.id)
                                onSelect(el.id)
                            }
                        }}
                    >
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            style={el.style}
                        >
                            {/* Resize Handles - Only Visible when selected and not editing */}
                            {selectedId === el.id && editingId !== el.id && (
                                <>
                                    {/* Corners */}
                                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 z-50 pointer-events-none" />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 z-50 pointer-events-none" />
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 z-50 pointer-events-none" />
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 z-50 pointer-events-none" />

                                    {/* Delete Button */}
                                    <div
                                        className="absolute -top-8 -right-2 bg-white shadow-sm border rounded p-1 cursor-pointer hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors z-[60]"
                                        onMouseDown={(e) => { // Use onMouseDown to prevent loss of focus/selection before click
                                            e.stopPropagation()
                                            removeElement(el.id)
                                        }}
                                        title="Delete Element"
                                    >
                                        <X className="w-3 h-3" />
                                    </div>
                                </>
                            )}

                            {el.type === 'text' && (
                                <SlideTextEditor
                                    content={el.content || ''}
                                    onChange={(html) => updateElement(el.id, { content: html })}
                                    editable={editingId === el.id}
                                    zoom={zoom}
                                    className="w-full h-full"
                                    style={{
                                        // Legacy style support (applied to wrapper)
                                        // Specific rich text styles override these in inner HTML
                                        fontSize: el.style.fontSize,
                                        color: el.style.color,
                                        textAlign: el.style?.textAlign as any,
                                        fontFamily: el.style.fontFamily as any,
                                    }}
                                />
                            )}
                            {el.type === 'image' && <img src={el.content || '/placeholder.png'} className="w-full h-full object-cover pointer-events-none" />}
                        </div>
                    </Rnd>
                ))}
            </div>
        </div>
    )
}
