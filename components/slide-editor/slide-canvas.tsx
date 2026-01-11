"use client"

import { Slide } from "@/lib/data"
import { useState, useEffect } from "react"
import { Rnd } from "react-rnd"
// import { v4 as uuidv4 } from 'uuid'
import { Plus, Type, Image as ImageIcon, Square, Circle as CircleIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ElementType = "text" | "image" | "rect" | "circle"

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
    const updateElements = (newElements: CanvasElement[]) => {
        setElements(newElements)
        onChange({ content: JSON.stringify(newElements) })
    }

    const addElement = (type: ElementType) => {
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 200 : 150,
            height: type === 'text' ? 50 : 150,
            content: type === 'text' ? 'Double click to edit' : '',
            style: {
                backgroundColor: type === 'rect' ? '#3b82f6' : type === 'circle' ? '#ef4444' : 'transparent',
                borderRadius: type === 'circle' ? '50%' : '0px',
                border: type === 'text' ? '1px dashed #ccc' : 'none',
                fontSize: '16px',
                color: '#000000',
            }
        }
        updateElements([...elements, newEl])
        updateElements([...elements, newEl])
        onSelect(newEl.id)
    }

    const removeElement = (id: string) => {
        const newElements = elements.filter(el => el.id !== id)
        updateElements(newElements)
        updateElements(newElements)
        if (selectedId === id) onSelect(null)
    }

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        const newElements = elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
        )
        updateElements(newElements)
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden bg-muted/30 relative">

            {/* Simple Toolbar for Canvas */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-md border rounded-md p-1 flex items-center gap-1 z-50">
                <Button variant="ghost" size="icon" onClick={() => addElement('text')} title="Add Text">
                    <Type className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => addElement('rect')} title="Add Rectangle">
                    <Square className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => addElement('circle')} title="Add Circle">
                    <CircleIcon className="w-4 h-4" />
                </Button>
                {selectedId && (
                    <>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => removeElement(selectedId!)} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete Selected">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>

            {/* The "Paper" / Slide */}
            <div
                className="aspect-video w-full max-w-4xl bg-white shadow-lg rounded-sm overflow-hidden relative"
                style={{
                    backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                    backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                onClick={() => onSelect(null)}
            >
                {elements.map(el => (
                    <Rnd
                        key={el.id}
                        size={{ width: el.width, height: el.height }}
                        position={{ x: el.x, y: el.y }}
                        onDragStop={(e, d) => {
                            updateElement(el.id, { x: d.x, y: d.y })
                        }}
                        onResizeStop={(e, direction, ref, delta, position) => {
                            updateElement(el.id, {
                                width: parseInt(ref.style.width),
                                height: parseInt(ref.style.height),
                                ...position,
                            })
                        }}
                        bounds="parent"
                        className={`group ${selectedId === el.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            onSelect(el.id)
                        }}
                    >
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            style={el.style}
                        >
                            {el.type === 'text' && (
                                <textarea
                                    className="w-full h-full bg-transparent resize-none outline-none border-none p-2"
                                    value={el.content}
                                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                    style={{
                                        fontSize: el.style.fontSize,
                                        color: el.style.color,
                                        textAlign: el.style?.textAlign as any
                                    }}
                                    readOnly={selectedId !== el.id}
                                />
                            )}
                            {el.type === 'image' && <img src={el.content || '/placeholder.png'} className="w-full h-full object-cover" />}
                        </div>
                    </Rnd>
                ))}
            </div>
        </div>
    )
}
