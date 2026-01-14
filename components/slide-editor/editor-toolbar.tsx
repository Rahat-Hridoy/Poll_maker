"use client"

import * as React from "react"
import {
    Type, Square, Circle, Image as ImageIcon,
    Copy, Trash2, Layers, Undo2, Redo2, ZoomIn, ZoomOut, Scissors,
    Triangle, ArrowRight, Star, Minus, Activity,
    ClipboardCopy, ClipboardPaste, CopyPlus, Square as SquareIcon,
    BringToFront, SendToBack, AlignCenterHorizontal, AlignCenterVertical,
    Link2, ImagePlus, Hexagon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CanvasElement, ElementType } from "./slide-canvas"

interface EditorToolbarProps {
    selectedElement: CanvasElement | null
    onAddElement: (type: ElementType, content?: string) => void
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
    onAddSlide: (type?: 'blank' | 'poll' | 'quiz' | 'qa') => void
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
    onAspectRatioChange,
    onAddSlide
}: EditorToolbarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            onAddElement('image', content)
        }
        reader.readAsDataURL(file)
    }


    const handleFormat = (key: string, value: any) => {
        if (!selectedElement) return
        onUpdateElement({
            style: { ...selectedElement.style, [key]: value }
        })
    }

    return (
        <div className="h-12 border-b bg-muted/40 flex items-center px-4 gap-2 overflow-x-auto shrink-0">
            {/* NEW SLIDE */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 gap-1.5 px-3 whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                        title="Add New Slide"
                    >
                        <CopyPlus className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Add Slide</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="start">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={() => onAddSlide('blank')}>
                            <Square className="w-4 h-4 mr-2" />
                            Blank
                        </Button>
                        <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={() => onAddSlide('poll')}>
                            <Activity className="w-4 h-4 mr-2" />
                            Poll
                        </Button>
                        <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={() => onAddSlide('quiz')}>
                            <Star className="w-4 h-4 mr-2" />
                            Quiz
                        </Button>
                        <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={() => onAddSlide('qa')}>
                            <Type className="w-4 h-4 mr-2" />
                            Q&A
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-6 mx-1" />


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
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()} title="Upload Image from PC">
                    <ImagePlus className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Shapes">
                            <SquareIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="bottom" align="start">
                        <div className="grid grid-cols-5 gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('rect')} title="Rectangle"><SquareIcon className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('circle')} title="Circle"><Circle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('triangle')} title="Triangle"><Triangle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('star')} title="Star"><Star className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('polygon')} title="Polygon"><Hexagon className="h-4 w-4" /></Button>

                            <Separator className="col-span-5 my-1" />

                            <Button variant="ghost" size="icon" onClick={() => onAddElement('line')} title="Line"><Minus className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('arrow-line')} title="Arrow Line"><ArrowRight className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('sine-wave')} title="Sine Wave"><Activity className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('square-wave')} title="Square Wave"><SquareIcon className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => onAddElement('tan-wave')} title="Tan Wave"><Activity className="h-4 w-4 rotate-90" /></Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1" /> {/* Spacer */}

            {/* CONTEXTUAL ACTIONS */}
            {selectedElement && (
                <>
                    {/* SHAPE COLORS */}
                    {/* SHAPE COLORS & BORDERS */}
                    {['rect', 'circle', 'triangle', 'arrow', 'star', 'polygon', 'line', 'arrow-line', 'sine-wave', 'square-wave', 'tan-wave'].includes(selectedElement.type) && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in duration-200">
                            {/* Fill Color (only for closed shapes) */}
                            {['rect', 'circle', 'triangle', 'star', 'polygon'].includes(selectedElement.type) && (
                                <div className="flex items-center gap-1.5 p-1 bg-background border rounded-md">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Fill</span>
                                    <input
                                        type="color"
                                        className="h-5 w-6 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
                                        value={selectedElement.style.backgroundColor?.toString() || 'transparent'}
                                        onChange={(e) => handleFormat('backgroundColor', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Border Color / Stroke */}
                            <div className="flex items-center gap-1.5 p-1 bg-background border rounded-md">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Stroke</span>
                                <input
                                    type="color"
                                    className="h-5 w-6 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
                                    value={selectedElement.style.borderColor?.toString() || (selectedElement.style as any).stroke || '#3b82f6'}
                                    onChange={(e) => {
                                        onUpdateElement({
                                            style: {
                                                ...selectedElement.style,
                                                borderColor: e.target.value,
                                                stroke: e.target.value
                                            }
                                        })
                                    }}
                                />
                            </div>

                            {/* Border Width */}
                            <div className="flex items-center gap-1.5 p-1 bg-background border rounded-md">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Width</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    className="h-5 w-10 p-1 text-[10px] bg-transparent border-0 focus-visible:ring-0 outline-none"
                                    value={parseInt(selectedElement.style.borderWidth?.toString() || (selectedElement.style as any).strokeWidth || '0')}
                                    onChange={(e) => {
                                        onUpdateElement({
                                            style: {
                                                ...selectedElement.style,
                                                borderWidth: e.target.value,
                                                strokeWidth: e.target.value
                                            }
                                        })
                                    }}
                                />
                            </div>

                            {/* Border Style */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 border" title="Border Style">
                                        <div className="flex flex-col gap-0.5 w-6">
                                            <div className="h-0.5 w-full bg-foreground" />
                                            <div className={`h-0.5 w-full bg-foreground ${selectedElement.style.borderStyle === 'solid' ? '' : 'opacity-30'}`} />
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 p-1" side="bottom" align="end">
                                    <div className="flex flex-col gap-1">
                                        <Button variant="ghost" size="sm" className="justify-start gap-2 h-8" onClick={() => handleFormat('borderStyle', 'solid')}>
                                            <div className="h-0.5 w-4 bg-foreground" />
                                            <span className="text-xs">Solid</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start gap-2 h-8" onClick={() => handleFormat('borderStyle', 'dashed')}>
                                            <div className="h-0.5 w-4 bg-foreground border-t-2 border-dashed border-transparent" style={{ borderTopColor: 'currentColor' }} />
                                            <span className="text-xs">Dashed</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start gap-2 h-8" onClick={() => handleFormat('borderStyle', 'dotted')}>
                                            <div className="h-0.5 w-4 bg-foreground border-t-2 border-dotted border-transparent" style={{ borderTopColor: 'currentColor' }} />
                                            <span className="text-xs">Dotted</span>
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => onClipboard('copy')} title="Copy"><ClipboardCopy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={() => onClipboard('cut')} title="Cut"><Scissors className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => onClipboard('paste')} title="Paste"><ClipboardPaste className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} title="Duplicate"><CopyPlus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onDelete} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </>
            )}
        </div>
    )
}
