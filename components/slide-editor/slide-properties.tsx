"use client"

import { Slide } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaintBucket, ImageIcon, Layout, BoxSelect, Type, Move, Trash2 } from "lucide-react"
import { CanvasElement } from "./slide-canvas"

interface SlidePropertiesProps {
    slide: Slide
    onChange: (updates: Partial<Slide>) => void
    presentationTheme: string
    onThemeChange: (theme: string) => void
    selectedElement: CanvasElement | null
    onElementChange: (updates: Partial<CanvasElement>) => void
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

export function SlideProperties({ slide, onChange, presentationTheme, onThemeChange, selectedElement, onElementChange }: SlidePropertiesProps) {
    return (
        <div className="p-4">
            <h3 className="font-semibold mb-4 text-sm">
                {selectedElement ? 'Element Properties' : 'Slide Properties'}
            </h3>

            <Tabs defaultValue={selectedElement ? "element" : "design"} value={selectedElement ? "element" : "design"}>
                <TabsList className="w-full mb-4">
                    {selectedElement ? (
                        <TabsTrigger value="element" className="flex-1">Element</TabsTrigger>
                    ) : (
                        <>
                            <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                            <TabsTrigger value="theme" className="flex-1">Theme</TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="element" className="space-y-6">
                    {!selectedElement ? null : (
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

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <BoxSelect className="w-4 h-4" />
                            Import
                        </Label>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            Import Live Poll (Soon)
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            Import Quiz (Soon)
                        </Button>
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
        </div>
    )
}
