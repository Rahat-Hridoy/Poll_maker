"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// Color Palette
export const PRESET_COLORS = [
    "#0f172a", // Slate 900
    "#334155", // Slate 700
    "#64748b", // Slate 500
    "#ffffff", // White
    "#2563eb", // Blue 600
    "#8b5cf6", // Violet 500
    "#ec4899", // Pink 500
    "#10b981", // Emerald 500
    "#f59e0b", // Amber 500
    "#ef4444", // Red 500
]

interface ColorPickerProps {
    label: string
    value: string
    onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</Label>
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color}
                        className={cn(
                            "h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                            value === color && "ring-2 ring-offset-1 ring-primary scale-110"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => onChange(color)}
                    />
                ))}
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-black/10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                </div>
            </div>
        </div>
    )
}

interface FontControlProps {
    fontFamily: string
    fontSize: number
    fontWeight: string
    color: string
    onUpdate: (updates: Partial<{ fontFamily: string; fontSize: number; fontWeight: string; color: string }>) => void
}

export function FontControls({ fontFamily, fontSize, fontWeight, color, onUpdate }: FontControlProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Font Family</Label>
                    <Select value={fontFamily} onValueChange={(v) => onUpdate({ fontFamily: v })}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                            <SelectItem value="system-ui, sans-serif">System</SelectItem>
                            <SelectItem value="Georgia, serif">Georgia</SelectItem>
                            <SelectItem value="'Courier New', monospace">Courier</SelectItem>
                            <SelectItem value="'Comic Sans MS', cursive">Comic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weight</Label>
                    <Select value={fontWeight} onValueChange={(v) => onUpdate({ fontWeight: v })} >
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="300">Light</SelectItem>
                            <SelectItem value="normal">Regular</SelectItem>
                            <SelectItem value="500">Medium</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Size</Label>
                    <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
                </div>
                {/* Note: Standard Slider might not be installed, using range input fallback if needed but assuming generic slider or building simple one */}
                <input
                    type="range"
                    min="12"
                    max="64"
                    value={fontSize}
                    onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <ColorPicker label="Color" value={color} onChange={(c) => onUpdate({ color: c })} />
        </div>
    )
}
