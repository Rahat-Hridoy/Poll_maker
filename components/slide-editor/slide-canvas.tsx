"use client"

import { Ruler } from "./ruler"
import { Slide } from "@/lib/data"
import { useState, useEffect, useRef } from "react"
import { Rnd } from "react-rnd"
import { X } from "lucide-react"
import { SlideTextEditor } from "./slide-text-editor"

export type ElementType = "text" | "image" | "rect" | "circle" | "triangle" | "arrow" | "star" | "line" | "arrow-line" | "polygon" | "sine-wave" | "square-wave" | "tan-wave"

export interface CanvasElement {
    id: string
    type: ElementType
    x: number
    y: number
    width: number
    height: number
    content?: string // For text or image URL
    style: React.CSSProperties
    rotation?: number
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
    const [isRotating, setIsRotating] = useState<string | null>(null)
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
                setIsRotating(null)
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
                    onMouseMove={(e) => {
                        if (isRotating && selectedId) {
                            const el = elements.find(item => item.id === selectedId)
                            if (!el) return

                            const rect = e.currentTarget.getBoundingClientRect()
                            // Center of element in pixels relative to viewport
                            const centerX = rect.left + (el.x + el.width / 2) * effectiveScale
                            const centerY = rect.top + (el.y + el.height / 2) * effectiveScale

                            const dx = e.clientX - centerX
                            const dy = e.clientY - centerY

                            // Calculate angle in degrees
                            let angle = Math.atan2(dy, dx) * (180 / Math.PI)
                            angle = (angle + 90) % 360 // Adjust so 0 is up
                            onElementUpdate(selectedId, { rotation: angle })
                        }
                    }}
                    onMouseUp={() => setIsRotating(null)}
                    onMouseLeave={() => setIsRotating(null)}
                >
                    {elements.map(el => (
                        <Rnd
                            key={el.id}
                            size={{ width: el.width, height: el.height }}
                            position={{ x: el.x, y: el.y }}
                            scale={effectiveScale}
                            style={{
                                transition: isRotating === el.id ? 'none' : 'all 0.1s ease-out',
                                zIndex: selectedId === el.id ? 10 : 1
                            }}
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
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                    ...el.style,
                                    transform: `rotate(${el.rotation || 0}deg)`,
                                    transformOrigin: 'center center',
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%'
                                }}
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

                                {/* SVG Shapes Rendering */}
                                {['rect', 'circle', 'triangle', 'arrow', 'star', 'polygon', 'line', 'arrow-line', 'sine-wave', 'square-wave', 'tan-wave'].includes(el.type) && (
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none overflow-visible">
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

                                            {/* Lines */}
                                            {el.type === 'line' && <line x1="0" y1="50" x2="100" y2="50" />}
                                            {el.type === 'arrow-line' && (
                                                <g>
                                                    <line x1="0" y1="50" x2="100" y2="50" />
                                                    <polygon points="90,40 100,50 90,60" fill="currentColor" stroke="none" />
                                                </g>
                                            )}

                                            {/* Waves */}
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

                                {/* Rotation Handle */}
                                {selectedId === el.id && !editingId && (
                                    <div
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-alias group-hover:opacity-100"
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            setIsRotating(el.id)
                                        }}
                                    >
                                        <div className="w-0.5 h-6 bg-blue-500" />
                                        <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-sm" />
                                    </div>
                                )}
                            </div>
                        </Rnd>
                    ))}
                </div>
            </div>
        </div>
    )
}
