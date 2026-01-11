"use client"

import * as React from "react"
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Type, Square, Circle, Image as ImageIcon, MousePointer2,
    Copy, Trash2, Layers, ChevronDown, BringToFront, SendToBack,
    Scissors, ClipboardCopy, ClipboardPaste, CopyPlus,
    Triangle, ArrowRight, Star,
    MoreHorizontal, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, AlignCenterVertical, AlignCenterHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CanvasElement } from "./slide-canvas"
import { Rnd } from "react-rnd"

export type ElementType = "text" | "image" | "rect" | "circle" | "triangle" | "arrow" | "star"

export interface FloatingToolbarProps {
    selectedElement: CanvasElement | null
    onAddElement: (type: ElementType) => void
    onUpdateElement: (updates: Partial<CanvasElement>) => void
    onDelete: () => void
    onDuplicate: () => void
    onArrange: (action: 'front' | 'back' | 'center-h' | 'center-v') => void
    onClipboard: (action: 'copy' | 'paste' | 'cut') => void
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
    zoom: number
    onZoomChange: (zoom: number) => void
}

export function FloatingToolbar({
    selectedElement,
    onAddElement,
    onUpdateElement,
    onDelete,
    onDuplicate,
    onArrange,
    onClipboard,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    zoom,
    onZoomChange
}: FloatingToolbarProps) {

    const handleFormat = (key: string, value: any) => {
        if (!selectedElement) return
        onUpdateElement({
            style: { ...selectedElement.style, [key]: value }
        })
    }

    const toggleStyle = (key: 'fontWeight' | 'fontStyle' | 'textDecoration', value: string, defaultValue: string) => {
        if (!selectedElement) return
        const current = selectedElement.style[key]
        handleFormat(key, current === value ? defaultValue : value)
    }

    return (
        <Rnd
            default={{ x: window.innerWidth / 2 - 400, y: 20, width: 'auto', height: 'auto' }}
            enableResizing={false}
            bounds="window"
            dragHandleClassName="toolbar-drag-handle"
            className="z-50 static! transform-none! pointer-events-auto"
        >
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-full border shadow-2xl flex items-center p-1.5 gap-1.5 overflow-hidden select-none mb-4">

                {/* Drag Handle */}
                <div className="toolbar-drag-handle px-2 cursor-move flex items-center justify-center opacity-50 hover:opacity-100">
                    <Layers className="h-4 w-4" />
                </div>

                {/* UNDO / REDO */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onUndo} disabled={!canUndo} title="Undo">
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onRedo} disabled={!canRedo} title="Redo">
                        <Redo2 className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* INSERT SECTION */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddElement('text')} title="Add Text">
                        <Type className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddElement('image')} title="Add Image">
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Shapes">
                                <Square className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" sideOffset={5}>
                            <div className="grid grid-cols-3 gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onAddElement('rect')} title="Rectangle"><Square className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => onAddElement('circle')} title="Circle"><Circle className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => onAddElement('triangle')} title="Triangle"><Triangle className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => onAddElement('arrow')} title="Arrow"><ArrowRight className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => onAddElement('star')} title="Star"><Star className="h-4 w-4" /></Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* EDITING / CLIPBOARD */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onClipboard('copy')} title="Copy"><ClipboardCopy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onClipboard('paste')} title="Paste"><ClipboardPaste className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onDuplicate} disabled={!selectedElement} title="Duplicate"><CopyPlus className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50" disabled={!selectedElement} onClick={onDelete} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>

                {/* CONTEXTUAL: TEXT FORMATTING - MOVED TO CONTEXT TOOLBAR */}

                {/* CONTEXTUAL: SHAPE FORMATTING */}
                {['rect', 'circle', 'triangle', 'arrow', 'star'].includes(selectedElement?.type || '') && (
                    <>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5 duration-200 px-1">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Fill</span>
                                <Input
                                    type="color"
                                    className="h-6 w-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer shadow-sm border"
                                    value={selectedElement?.style.backgroundColor?.toString() || 'transparent'}
                                    onChange={(e) => handleFormat('backgroundColor', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Stroke</span>
                                <Input
                                    type="color"
                                    className="h-6 w-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer shadow-sm border"
                                    value={selectedElement?.style.borderColor?.toString() || 'transparent'}
                                    onChange={(e) => handleFormat('borderColor', e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ARRANGE (Only visible if selected) */}
                {selectedElement && (
                    <>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onArrange('front')} title="Bring to Front"><BringToFront className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onArrange('back')} title="Send to Back"><SendToBack className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onArrange('center-h')} title="Center Horizontally"><AlignCenterHorizontal className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onArrange('center-v')} title="Center Vertically"><AlignCenterVertical className="h-3.5 w-3.5" /></Button>
                        </div>
                    </>
                )}

                <Separator orientation="vertical" className="h-6" />

                {/* ZOOM */}
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))} title="Zoom Out"><ZoomOut className="h-3.5 w-3.5" /></Button>
                    <span className="text-xs w-8 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onZoomChange(Math.min(3, zoom + 0.1))} title="Zoom In"><ZoomIn className="h-3.5 w-3.5" /></Button>
                </div>

            </div>
        </Rnd>
    )
}
