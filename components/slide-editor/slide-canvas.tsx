"use client"

import { Ruler } from "./ruler"
import { Slide } from "@/lib/data"
import { useState, useEffect, useRef } from "react"
import { Rnd } from "react-rnd"
import { X } from "lucide-react"
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
    elements: CanvasElement[]
    zoom: number
    selectedId: string | null
    onSelect: (id: string | null) => void
    onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void
    onElementRemove: (id: string) => void
    aspectRatio?: '16:9' | '4:3' | '1:1'
}

export function SlideCanvas({
    slide,
    elements,
    zoom,
    selectedId,
    onSelect,
    onElementUpdate,
    onElementRemove,
    aspectRatio = '16:9'
}: SlideCanvasProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // Calculate base dimensions from aspect ratio
    const baseWidth = 1000 // Fixed internal coordinate system width
    const getBaseHeight = (ratio: string) => {
        const [w, h] = ratio.split(':').map(Number)
        return (baseWidth * h) / w
    }
    const baseHeight = getBaseHeight(aspectRatio)

    // Fit canvas to container
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                const { width: containerWidth, height: containerHeight } = entry.contentRect

                // Add padding and space for rulers (20px)
                // Rulers are roughly 20px thick. We need space around.
                // Let's reserve 70px padding total
                // (25px ruler+gap on top/left) + room for bottom/right

                const safeWidth = containerWidth - 70
                const safeHeight = containerHeight - 70

                const scaleX = safeWidth / baseWidth
                const scaleY = safeHeight / baseHeight

                // Use minimum scale to fit, never scale up beyond a reasonable max if needed,
                // but for "filling" free space, we just fit.
                // However, user zoom is applied ON TOP of this fit.
                const newScale = Math.min(scaleX, scaleY)
                setScale(newScale)
                setDimensions({ width: containerWidth, height: containerHeight })
            }
        })

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [aspectRatio, baseHeight]) // re-calc when ratio changes

    // Final transform combines fitting scale AND user zoom
    const effectiveScale = scale * zoom

    return (
        <div
            ref={containerRef}
            className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-muted/30 relative select-none h-full w-full"
            onClick={() => {
                onSelect(null)
                setEditingId(null)
            }}
        >
            {/* Canvas Wrapper with Scale */}
            <div
                style={{
                    transform: `scale(${effectiveScale})`,
                    transformOrigin: 'center center',
                    width: baseWidth,
                    height: baseHeight,
                    position: 'relative' // Needed for rulers absolute pos relative to this
                }}
            >
                {/* Rulers */}
                <div
                    className="absolute -top-[25px] -left-[25px] w-5 h-5 bg-muted border border-border z-20"
                /> {/* Corner Box positioned at intersection of rulers with 5px gap */}
                <Ruler orientation="horizontal" length={baseWidth} gap={10} />
                <Ruler orientation="vertical" length={baseHeight} gap={10} />

                {/* The "Paper" / Slide */}
                <div
                    className="shadow-2xl rounded-sm overflow-hidden relative transition-all duration-300 ease-in-out border border-border/40 bg-white"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                        backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                        backgroundPosition: 'center',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelect(null)
                        setEditingId(null)
                    }}
                >
                    {elements.map(el => (
                        <Rnd
                            key={el.id}
                            size={{ width: el.width, height: el.height }}
                            position={{ x: el.x, y: el.y }}
                            scale={effectiveScale} // Crucial for Rnd to work correctly on scaled canvas
                            onDragStop={(e, d) => {
                                if (editingId === el.id) return
                                onElementUpdate(el.id, { x: d.x, y: d.y })
                            }}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                if (editingId === el.id) return
                                onElementUpdate(el.id, {
                                    width: parseInt(ref.style.width),
                                    height: parseInt(ref.style.height),
                                    ...position,
                                })
                            }}
                            disableDragging={editingId === el.id}
                            enableResizing={editingId !== el.id}
                            bounds="parent"
                            className={`group ${selectedId === el.id ? 'ring-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-500/30'} `}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                // Only select if not already editing another element
                                if (editingId !== el.id) {
                                    onSelect(el.id)
                                }
                            }}
                            onDoubleClick={(e: React.MouseEvent) => {
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
                                            className="absolute -top-8 -right-2 bg-white shadow-sm border rounded p-1 cursor-pointer hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors z-60"
                                            onMouseDown={(e: React.MouseEvent) => { // Use onMouseDown to prevent loss of focus/selection before click
                                                e.stopPropagation()
                                                onElementRemove(el.id)
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
                                        onChange={(html) => onElementUpdate(el.id, { content: html })}
                                        editable={editingId === el.id}
                                        zoom={effectiveScale} // Pass effective scale to text editor if needed
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
        </div>
    )
}
