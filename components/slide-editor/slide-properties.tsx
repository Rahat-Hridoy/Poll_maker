"use client"

import { Slide, Poll } from "@/lib/data"
import { useState, useEffect } from "react"
import { fetchMyPolls } from "@/app/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaintBucket, ImageIcon, Layout, BoxSelect, Type, Move, Trash2, QrCode, BarChart3, MessageSquare, ListTodo, Loader2, Trophy, CheckCircle2, PieChart, PanelLeft, PanelRight, Columns, Rows } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface SlidePropertiesProps {
    slide: Slide
    onChange: (updates: Partial<Slide>) => void
    presentationTheme: string
    onThemeChange: (theme: string) => void
    selectedElement: CanvasElement | null
    onElementChange: (updates: Partial<CanvasElement>) => void
    onAddPoll: (pollId: string, pollTitle: string) => void
    onAddQRCode: (shortCode: string, pollTitle: string) => void
}

const COLORS = [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", // Grays
    "#fef2f2", "#fee2e2", "#fecaca", // Reds
    "#eff6ff", "#dbeafe", "#bfdbfe", // Blues
    "#f0fdf4", "#dcfce7", "#bbf7d0", // Greens
    "#faf5ff", "#f3e8ff", "#e9d5ff", // Purples
    "#fffbeb", "#fef3c7", "#fde68a", // Yellows
]

const THEMES = [
    { id: 'default', name: 'Default', bg: '#ffffff' },
    { id: 'dark', name: 'Dark Mode', bg: '#0f172a' },
    { id: 'pastel', name: 'Pastel', bg: '#fdf4ff' },
    { id: 'corporate', name: 'Corporate', bg: '#f8fafc' },
]

export function SlideProperties({ slide, onChange, presentationTheme, onThemeChange, selectedElement, onElementChange, onAddPoll, onAddQRCode }: SlidePropertiesProps) {
    const [myPolls, setMyPolls] = useState<Poll[]>([])
    const [loadingPolls, setLoadingPolls] = useState(false)
    const [activeTab, setActiveTab] = useState(selectedElement ? "element" : "design")
    const [isPollDialogOpen, setIsPollDialogOpen] = useState(false)

    useEffect(() => {
        if (selectedElement) {
            setActiveTab("element")
        } else if (activeTab === "element") {
            setActiveTab("design")
        }
    }, [selectedElement, activeTab])

    useEffect(() => {
        const loadPolls = async () => {
            setLoadingPolls(true)
            try {
                const polls = await fetchMyPolls()
                setMyPolls(polls)
            } catch (error) {
                console.error("Failed to fetch polls", error)
            } finally {
                setLoadingPolls(false)
            }
        }
        loadPolls()
    }, [])
    return (
        <div className="p-4">
            <h3 className="font-semibold mb-4 text-sm">
                {selectedElement ? 'Element Properties' : 'Slide Properties'}
            </h3>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {selectedElement ? null : (
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                        <TabsTrigger value="import" className="flex-1">Import</TabsTrigger>
                        <TabsTrigger value="theme" className="flex-1">Theme</TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="element" className="space-y-6">
                    {!selectedElement ? null : (
                        <>
                            {/* Generic Properties (Hidden for Templates) */}
                            {!['poll-template', 'quiz-template', 'qa-template'].includes(selectedElement.type) && (
                                <>
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Move className="w-4 h-4" />
                                            Position & Size
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-muted-foreground">X</label>
                                                <Input
                                                    type="number"
                                                    value={Math.round(selectedElement.x)}
                                                    onChange={(e) => onElementChange({ x: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-muted-foreground">Y</label>
                                                <Input
                                                    type="number"
                                                    value={Math.round(selectedElement.y)}
                                                    onChange={(e) => onElementChange({ y: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-muted-foreground">Width</label>
                                                <Input
                                                    type="number"
                                                    value={Math.round(selectedElement.width)}
                                                    onChange={(e) => onElementChange({ width: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-muted-foreground">Height</label>
                                                <Input
                                                    type="number"
                                                    value={Math.round(selectedElement.height)}
                                                    onChange={(e) => onElementChange({ height: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <PaintBucket className="w-4 h-4" />
                                            Style
                                        </Label>
                                        <div className="space-y-2">
                                            <label className="text-xs text-muted-foreground">Background Color</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    className="w-8 h-8 p-0 border-0"
                                                    value={selectedElement.style.backgroundColor?.toString() || '#transparent'}
                                                    onChange={(e) => onElementChange({
                                                        style: { ...selectedElement.style, backgroundColor: e.target.value }
                                                    })}
                                                />
                                                <Input
                                                    value={selectedElement.style.backgroundColor?.toString() || ''}
                                                    onChange={(e) => onElementChange({
                                                        style: { ...selectedElement.style, backgroundColor: e.target.value }
                                                    })}
                                                    placeholder="transparent"
                                                />
                                            </div>
                                        </div>
                                        {selectedElement.type === 'text' && (
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground">Text Color</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        className="w-8 h-8 p-0 border-0"
                                                        value={selectedElement.style.color?.toString() || '#000000'}
                                                        onChange={(e) => onElementChange({
                                                            style: { ...selectedElement.style, color: e.target.value }
                                                        })}
                                                    />
                                                    <Input
                                                        value={selectedElement.style.color?.toString() || ''}
                                                        onChange={(e) => onElementChange({
                                                            style: { ...selectedElement.style, color: e.target.value }
                                                        })}
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <Input
                                                        type="number"
                                                        value={parseInt(selectedElement.style.fontSize?.toString() || '16')}
                                                        onChange={(e) => onElementChange({
                                                            style: { ...selectedElement.style, fontSize: `${e.target.value}px` }
                                                        })}
                                                        placeholder="Font Size"
                                                    />
                                                    <span className="flex items-center text-sm">px</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Poll Template Editing */}
                            {selectedElement.type === 'poll-template' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        Poll Data
                                    </Label>

                                    {(() => {
                                        let data = { question: '', options: [] as any[], questionImage: '' }
                                        try {
                                            data = JSON.parse(selectedElement.content || '{}')
                                        } catch { }

                                        const updateData = (newData: any) => {
                                            onElementChange({ content: JSON.stringify({ ...data, ...newData }) })
                                        }

                                        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'questionImage' | 'optionImage', optionIndex?: number) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    const base64String = reader.result as string
                                                    if (field === 'questionImage') {
                                                        updateData({ questionImage: base64String })
                                                    } else if (field === 'optionImage' && optionIndex !== undefined) {
                                                        const newOptions = [...data.options]
                                                        newOptions[optionIndex] = { ...newOptions[optionIndex], image: base64String }
                                                        updateData({ options: newOptions })
                                                    }
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }

                                        return (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">Question</Label>
                                                    <Input
                                                        value={data.question}
                                                        onChange={(e) => updateData({ question: e.target.value })}
                                                        placeholder="Poll Question..."
                                                    />

                                                    {/* Chart Type Selector */}
                                                    <div className="flex bg-slate-100 p-1 rounded-md gap-1">
                                                        <button
                                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${!data['chartType'] || data['chartType'] === 'bar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                            onClick={() => updateData({ chartType: 'bar' })}
                                                        >
                                                            <BarChart3 className="w-3.5 h-3.5" />
                                                            Bar Chart
                                                        </button>
                                                        <button
                                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${data['chartType'] === 'pie' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                            onClick={() => updateData({ chartType: 'pie' })}
                                                        >
                                                            <PieChart className="w-3.5 h-3.5" />
                                                            Pie Chart
                                                        </button>
                                                    </div>

                                                    {/* Layout Selector */}
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-muted-foreground">Layout Theme</label>
                                                        <div className="flex bg-slate-100 p-1 rounded-md gap-1">
                                                            <button
                                                                title="Vertical (Image Top)"
                                                                className={`flex-1 flex items-center justify-center py-2 rounded-sm transition-all ${!data['layout'] || data['layout'] === 'vertical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                                onClick={() => updateData({ layout: 'vertical' })}
                                                            >
                                                                <Rows className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                title="Image Left"
                                                                className={`flex-1 flex items-center justify-center py-2 rounded-sm transition-all ${data['layout'] === 'horizontal-left' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                                onClick={() => updateData({ layout: 'horizontal-left' })}
                                                            >
                                                                <PanelLeft className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                title="Image Right"
                                                                className={`flex-1 flex items-center justify-center py-2 rounded-sm transition-all ${data['layout'] === 'horizontal-right' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                                onClick={() => updateData({ layout: 'horizontal-right' })}
                                                            >
                                                                <PanelRight className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                title="Split Screen"
                                                                className={`flex-1 flex items-center justify-center py-2 rounded-sm transition-all ${data['layout'] === 'split-left' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                                                onClick={() => updateData({ layout: 'split-left' })}
                                                            >
                                                                <Columns className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Question Image Input */}
                                                    <div className="flex items-center gap-2">
                                                        {data.questionImage ? (
                                                            <div className="relative w-full h-32 border rounded-lg overflow-hidden group">
                                                                <img src={data.questionImage} alt="Question" className="w-full h-full object-cover" />
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => updateData({ questionImage: '' })}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full">
                                                                <label
                                                                    htmlFor="question-image-upload"
                                                                    className="flex items-center justify-center w-full h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 text-slate-400 gap-2 hover:text-slate-600 transition-colors"
                                                                >
                                                                    <ImageIcon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Add Image to Question</span>
                                                                </label>
                                                                <input
                                                                    id="question-image-upload"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleImageUpload(e, 'questionImage')}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground">Options</label>
                                                    <div className="space-y-2">
                                                        {data.options?.map((opt: any, idx: number) => (
                                                            <div key={opt.id || idx} className="flex gap-2">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button
                                                                            className="w-10 h-10 shrink-0 rounded-md shadow-sm border border-slate-200 transition-transform hover:scale-105 overflow-hidden relative"
                                                                            style={{ backgroundColor: opt.image ? 'transparent' : (opt.color || '#cbd5e1') }}
                                                                        >
                                                                            {opt.image && (
                                                                                <img src={opt.image} alt="Option Pattern" className="w-full h-full object-cover" />
                                                                            )}
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-72 p-0 overflow-hidden" align="start">
                                                                        <Tabs defaultValue={opt.image ? "image" : "color"} className="w-full">
                                                                            <TabsList className="w-full rounded-none border-b bg-muted/50 p-0 h-9">
                                                                                <TabsTrigger value="color" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background h-9 text-xs">Solid Color</TabsTrigger>
                                                                                <TabsTrigger value="image" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background h-9 text-xs">Image Pattern</TabsTrigger>
                                                                            </TabsList>

                                                                            <div className="p-3">
                                                                                <TabsContent value="color" className="mt-0 space-y-3">
                                                                                    <div className="grid grid-cols-5 gap-2">
                                                                                        {[
                                                                                            "#3b82f6", "#a855f7", "#10b981", "#f97316",
                                                                                            "#ec4899", "#ef4444", "#eab308", "#06b6d4",
                                                                                            "#64748b", "#0f172a"
                                                                                        ].map(color => (
                                                                                            <button
                                                                                                key={color}
                                                                                                className={`w-8 h-8 rounded-full border shadow-sm ${opt.color === color && !opt.image ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                                                                style={{ backgroundColor: color }}
                                                                                                onClick={() => {
                                                                                                    const newOptions = [...data.options]
                                                                                                    // Clear image when selecting color
                                                                                                    newOptions[idx] = { ...opt, color, image: undefined }
                                                                                                    updateData({ options: newOptions })
                                                                                                }}
                                                                                            />
                                                                                        ))}
                                                                                    </div>
                                                                                    <Separator />
                                                                                    <div className="flex gap-2">
                                                                                        <Input
                                                                                            type="color"
                                                                                            value={opt.color || '#000000'}
                                                                                            className="w-8 h-8 p-0 border-0 shrink-0"
                                                                                            onChange={(e) => {
                                                                                                const newOptions = [...data.options]
                                                                                                newOptions[idx] = { ...opt, color: e.target.value, image: undefined }
                                                                                                updateData({ options: newOptions })
                                                                                            }}
                                                                                        />
                                                                                        <Input
                                                                                            value={opt.color || ''}
                                                                                            className="h-8 text-xs"
                                                                                            placeholder="#000000"
                                                                                            onChange={(e) => {
                                                                                                const newOptions = [...data.options]
                                                                                                newOptions[idx] = { ...opt, color: e.target.value, image: undefined }
                                                                                                updateData({ options: newOptions })
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </TabsContent>
                                                                                <TabsContent value="image" className="mt-0 space-y-3">
                                                                                    <div className="text-center space-y-3">
                                                                                        {opt.image ? (
                                                                                            <div className="relative w-full h-32 border rounded-md overflow-hidden bg-slate-100 group">
                                                                                                <img src={opt.image} alt="Preview" className="w-full h-full object-cover" />
                                                                                                <Button
                                                                                                    variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                    onClick={() => {
                                                                                                        const newOptions = [...data.options]
                                                                                                        newOptions[idx] = { ...opt, image: undefined }
                                                                                                        updateData({ options: newOptions })
                                                                                                    }}
                                                                                                >
                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="w-full">
                                                                                                <label
                                                                                                    htmlFor={`option-image-upload-${idx}`}
                                                                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 text-slate-400 gap-2 hover:text-slate-600 transition-colors"
                                                                                                >
                                                                                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                                                                                    <span className="text-xs font-medium">Upload Image Pattern</span>
                                                                                                </label>
                                                                                                <input
                                                                                                    id={`option-image-upload-${idx}`}
                                                                                                    type="file"
                                                                                                    accept="image/*"
                                                                                                    className="hidden"
                                                                                                    onChange={(e) => handleImageUpload(e, 'optionImage', idx)}
                                                                                                />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </TabsContent>
                                                                            </div>
                                                                        </Tabs>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <Input
                                                                    value={opt.text}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...data.options]
                                                                        newOptions[idx] = { ...opt, text: e.target.value }
                                                                        updateData({ options: newOptions })
                                                                    }}
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 shrink-0 hover:bg-slate-100 text-slate-400 hover:text-red-500"
                                                                    onClick={() => {
                                                                        const newOptions = data.options.filter((_: any, i: number) => i !== idx)
                                                                        updateData({ options: newOptions })
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full h-8 text-xs border-dashed text-muted-foreground hover:text-foreground"
                                                            onClick={() => {
                                                                const colors = [
                                                                    "#3b82f6", // blue-500
                                                                    "#a855f7", // purple-500
                                                                    "#10b981", // emerald-500
                                                                    "#f97316", // orange-500
                                                                    "#ec4899", // pink-500
                                                                    "#ef4444", // red-500
                                                                    "#eab308", // yellow-500
                                                                    "#06b6d4", // cyan-500
                                                                ]
                                                                const newOption = {
                                                                    id: crypto.randomUUID(),
                                                                    text: `Option ${(data.options?.length || 0) + 1}`,
                                                                    votes: 0,
                                                                    color: colors[(data.options?.length || 0) % colors.length]
                                                                }
                                                                updateData({ options: [...(data.options || []), newOption] })
                                                            }}
                                                        >
                                                            + Add Option
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}

                            {/* Quiz Template Editing */}
                            {selectedElement?.type === 'quiz-template' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        Quiz Data
                                    </Label>

                                    {(() => {
                                        let data = { question: '', options: [] as any[] }
                                        try {
                                            data = JSON.parse(selectedElement?.content || '{}')
                                        } catch { }

                                        const updateData = (newData: any) => {
                                            onElementChange({ content: JSON.stringify({ ...data, ...newData }) })
                                        }

                                        return (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground">Question</label>
                                                    <Input
                                                        value={data.question}
                                                        onChange={(e) => updateData({ question: e.target.value })}
                                                        placeholder="Quiz Question..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground">Options (Select correct one)</label>
                                                    <div className="space-y-2">
                                                        {data.options?.map((opt: any, idx: number) => (
                                                            <div key={opt.id || idx} className="flex gap-2 items-center">
                                                                <button
                                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300'}`}
                                                                    onClick={() => {
                                                                        const newOptions = data.options.map((o: any, i: number) => ({
                                                                            ...o,
                                                                            isCorrect: i === idx // Only one correct answer for now
                                                                        }))
                                                                        updateData({ options: newOptions })
                                                                    }}
                                                                >
                                                                    {opt.isCorrect && <CheckCircle2 className="w-3 h-3" />}
                                                                </button>
                                                                <Input
                                                                    value={opt.text}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...data.options]
                                                                        newOptions[idx] = { ...opt, text: e.target.value }
                                                                        updateData({ options: newOptions })
                                                                    }}
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 shrink-0 hover:bg-slate-100 text-slate-400 hover:text-red-500"
                                                                    onClick={() => {
                                                                        const newOptions = data.options.filter((_: any, i: number) => i !== idx)
                                                                        updateData({ options: newOptions })
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full h-8 text-xs border-dashed text-muted-foreground hover:text-foreground"
                                                            onClick={() => {
                                                                const newOption = {
                                                                    id: crypto.randomUUID(),
                                                                    text: `Answer Option ${(data.options?.length || 0) + 1}`,
                                                                    isCorrect: false
                                                                }
                                                                updateData({ options: [...(data.options || []), newOption] })
                                                            }}
                                                        >
                                                            + Add Option
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}

                            {/* Q&A Template Editing */}
                            {selectedElement?.type === 'qa-template' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Q&A Data
                                    </Label>

                                    {(() => {
                                        let data = { title: '', subtitle: '' }
                                        try {
                                            data = JSON.parse(selectedElement?.content || '{}')
                                        } catch { }

                                        const updateData = (newData: any) => {
                                            onElementChange({ content: JSON.stringify({ ...data, ...newData }) })
                                        }

                                        return (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground">Title</label>
                                                    <Input
                                                        value={data.title}
                                                        onChange={(e) => updateData({ title: e.target.value })}
                                                        placeholder="Q&A Session"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-muted-foreground">Subtitle / Instructions</label>
                                                    <Input
                                                        value={data.subtitle}
                                                        onChange={(e) => updateData({ subtitle: e.target.value })}
                                                        placeholder="Ask your questions..."
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="design" className="space-y-6">
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <PaintBucket className="w-4 h-4" />
                            Background Color
                        </Label>
                        <div className="grid grid-cols-6 gap-2">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-primary ${slide.background === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => onChange({ background: color })}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={slide.background || ''}
                                onChange={(e) => onChange({ background: e.target.value })}
                                placeholder="Custom Hex (#000000)"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Background Image
                        </Label>
                        <Input
                            value={slide.background?.startsWith('http') ? slide.background : ''}
                            onChange={(e) => onChange({ background: e.target.value })}
                            placeholder="Image URL..."
                        />
                        <p className="text-xs text-muted-foreground">Paste a URL to an image to set it as background.</p>
                    </div>
                </TabsContent>

                <TabsContent value="import" className="space-y-6">
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            <BoxSelect className="w-4 h-4" />
                            Select Type
                        </Label>

                        <div className="grid gap-2">
                            <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start gap-3 h-12">
                                        <BarChart3 className="w-5 h-5 text-blue-500" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-semibold">Poll</span>
                                            <span className="text-[10px] text-muted-foreground">Import live results or QR</span>
                                        </div>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Select a Poll to Import</DialogTitle>
                                        <DialogDescription>
                                            Choose a poll from your dashboard to add to the current slide.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto pr-2 py-4">
                                        {loadingPolls ? (
                                            <div className="flex flex-col items-center justify-center p-12 gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                <span className="text-sm text-muted-foreground">Fetching your polls...</span>
                                            </div>
                                        ) : myPolls.length === 0 ? (
                                            <div className="text-center p-12 border-2 border-dashed rounded-xl">
                                                <p className="text-slate-500 mb-4">You haven't created any polls yet.</p>
                                                <Button onClick={() => window.open('/admin/dashboard', '_blank')}>
                                                    Go to Dashboard
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {myPolls.map(poll => (
                                                    <div key={poll.id} className="p-4 border rounded-xl bg-card hover:border-primary transition-all group">
                                                        <div className="flex flex-col gap-1 mb-4">
                                                            <h4 className="font-bold text-slate-900 truncate">{poll.title}</h4>
                                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <ListTodo className="w-3 h-3" />
                                                                    {poll.questions.length} Qs
                                                                </span>
                                                                <span>•</span>
                                                                <span>Code: {poll.shortCode}</span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-[11px] h-9 gap-1.5"
                                                                onClick={() => {
                                                                    onAddPoll(poll.id, poll.title)
                                                                    setIsPollDialogOpen(false)
                                                                }}
                                                            >
                                                                <BarChart3 className="w-3.5 h-3.5" />
                                                                Interface
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-[11px] h-9 gap-1.5"
                                                                onClick={() => {
                                                                    onAddQRCode(poll.shortCode, poll.title)
                                                                    setIsPollDialogOpen(false)
                                                                }}
                                                            >
                                                                <QrCode className="w-3.5 h-3.5" />
                                                                QR Code
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" className="w-full justify-start gap-3 h-12 opacity-60 cursor-not-allowed" disabled>
                                <MessageSquare className="w-5 h-5 text-purple-500" />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold">Q&A</span>
                                    <span className="text-[10px] text-muted-foreground">Coming Soon</span>
                                </div>
                            </Button>

                            <Button variant="outline" className="w-full justify-start gap-3 h-12 opacity-60 cursor-not-allowed" disabled>
                                <ListTodo className="w-5 h-5 text-orange-500" />
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-semibold">Quiz</span>
                                    <span className="text-[10px] text-muted-foreground">Coming Soon</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="theme" className="space-y-6">
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            Global Theme
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => onThemeChange(theme.id)}
                                    className={`p-3 text-left rounded-lg border transition-all hover:border-primary ${presentationTheme === theme.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}`}
                                >
                                    <div className="w-full h-12 rounded mb-2 border" style={{ backgroundColor: theme.bg }} />
                                    <span className="text-sm font-medium">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
