"use client"

import * as React from "react"
import {
    Type, Square, Circle, Image as ImageIcon,
    Copy, Trash2, Layers, Undo2, Redo2, ZoomIn, ZoomOut,
    Triangle, ArrowRight, Star,
    ClipboardCopy, ClipboardPaste, CopyPlus,
    BringToFront, SendToBack, AlignCenterHorizontal, AlignCenterVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CanvasElement, ElementType } from "./slide-canvas"

interface EditorToolbarProps {
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
    aspectRatio: string
    onAspectRatioChange: (ratio: '16:9' | '4:3' | '1:1') => void
}

export function EditorToolbar({
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
    onZoomChange,
    aspectRatio,
    onAspectRatioChange
}: EditorToolbarProps) {

    const handleFormat = (key: string, value: any) => {
        if (!selectedElement) return
        onUpdateElement({
            style: { ...selectedElement.style, [key]: value }
        })
    }

    return (
        <div className="h-12 border-b bg-muted/40 flex items-center px-4 gap-2 overflow-x-auto shrink-0">

            {/* UNDO / REDO */}
            <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo} title="Undo">
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo} title="Redo">
                    <Redo2 className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* ZOOM & ASPECT */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))} title="Zoom Out">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs w-10 text-center tabular-nums font-medium">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onZoomChange(Math.min(3, zoom + 0.1))} title="Zoom In">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-4 mx-1" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            {aspectRatio}
                            <Triangle className="h-2 w-2 rotate-180 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-24 p-1">
                        <div className="grid gap-1">
                            {['16:9', '4:3', '1:1'].map((ratio) => (
                                <Button
                                    key={ratio}
                                    variant={aspectRatio === ratio ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 text-xs justify-start"
                                    onClick={() => onAspectRatioChange(ratio as any)}
                                >
                                    {ratio}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* INSERT */}
            <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAddElement('text')} title="Add Text">
                    <Type className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAddElement('image')} title="Add Image">
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Shapes">
                            <Square className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="bottom" align="start">
                        <div className="grid grid-cols-5 gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('rect')} title="Rectangle"><Square className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('circle')} title="Circle"><Circle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('triangle')} title="Triangle"><Triangle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('arrow')} title="Arrow"><ArrowRight className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('star')} title="Star"><Star className="h-4 w-4" /></Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1" /> {/* Spacer */}

            {/* CONTEXTUAL ACTIONS */}
            {selectedElement && (
                <>
                    {/* SHAPE COLORS */}
                    {['rect', 'circle', 'triangle', 'arrow', 'star'].includes(selectedElement.type) && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in duration-200">
                            <div className="flex items-center gap-1.5 p-1 bg-background border rounded-md">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Fill</span>
                                <Input
                                    type="color"
                                    className="h-5 w-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                    value={selectedElement.style.backgroundColor?.toString() || 'transparent'}
                                    onChange={(e) => handleFormat('backgroundColor', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-background border rounded-md">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Stroke</span>
                                <Input
                                    type="color"
                                    className="h-5 w-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                    value={selectedElement.style.borderColor?.toString() || 'transparent'}
                                    onChange={(e) => handleFormat('borderColor', e.target.value)}
                                />
                            </div>
                            <Separator orientation="vertical" className="h-6 mx-1" />
                        </div>
                    )}

                    {/* ARRANGE */}
                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArrange('front')} title="Bring to Front"><BringToFront className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArrange('back')} title="Send to Back"><SendToBack className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArrange('center-h')} title="Center Horizontally"><AlignCenterHorizontal className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArrange('center-v')} title="Center Vertically"><AlignCenterVertical className="h-4 w-4" /></Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    {/* CLIPBOARD & DELETE */}
                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onClipboard('copy')} title="Copy"><ClipboardCopy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onClipboard('paste')} title="Paste"><ClipboardPaste className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} title="Duplicate"><CopyPlus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onDelete} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </>
            )}
        </div>
    )
}
