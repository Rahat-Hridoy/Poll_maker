"use client"

import * as React from "react"
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    ChevronDown, Minus, Plus, Superscript, Subscript
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Editor } from '@tiptap/react'

export interface TextContextToolbarProps {
    editor: Editor
}

const FONTS = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', serif" },
    { name: "Courier New", value: "'Courier New', monospace" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
]

export function TextContextToolbar({ editor }: TextContextToolbarProps) {
    if (!editor) return null

    const setFontFamily = (value: string) => {
        const current = editor.getAttributes('textStyle')
        editor.chain().focus().setMark('textStyle', { ...current, fontFamily: value }).run()
    }

    const setFontSize = (increment: number) => {
        const currentAttributes = editor.getAttributes('textStyle')
        const currentSize = currentAttributes.fontSize || '16px'
        const size = parseInt(currentSize) + increment
        editor.chain().focus().setMark('textStyle', { ...currentAttributes, fontSize: `${Math.max(8, size)}px` }).run()
    }

    const setColor = (value: string) => {
        const current = editor.getAttributes('textStyle')
        editor.chain().focus().setMark('textStyle', { ...current, color: value }).run()
    }

    const currentFontSize = parseInt(editor.getAttributes('textStyle').fontSize || '16px') // Default to 16 if not set

    return (
        <div
            className="flex items-center gap-1 p-1 bg-white border rounded-md shadow-xl select-none"
            onMouseDown={(e) => e.preventDefault()} // Critical: Prevent focus loss from editor
            onClick={(e) => e.stopPropagation()} // Prevent bubbling
        >
            {/* Font Family */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2 flex gap-1 font-normal w-24 justify-between">
                        <span className="truncate">{FONTS.find(f => f.value === editor.getAttributes('textStyle').fontFamily)?.name || 'Font'}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1">
                    {FONTS.map(font => (
                        <Button
                            key={font.name}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-7 text-xs"
                            onClick={() => setFontFamily(font.value)}
                            style={{ fontFamily: font.value }}
                        >
                            {font.name}
                        </Button>
                    ))}
                </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-4" />

            {/* Font Size */}
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFontSize(-2)}>
                    <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs w-6 text-center">{currentFontSize}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFontSize(2)}>
                    <Plus className="h-3 w-3" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Styles */}
            <div className="flex items-center gap-0.5">
                <Button
                    variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                    size="icon" className="h-7 w-7"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                    size="icon" className="h-7 w-7"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                    size="icon" className="h-7 w-7"
                    onClick={() => editor.chain().focus().toggleMark('underline').run()}
                >
                    <Underline className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant={editor.isActive('superscript') ? 'secondary' : 'ghost'}
                    size="icon" className="h-7 w-7"
                    onClick={() => editor.chain().focus().toggleMark('superscript').run()}
                    title="Superscript"
                >
                    <Superscript className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant={editor.isActive('subscript') ? 'secondary' : 'ghost'}
                    size="icon" className="h-7 w-7"
                    onClick={() => editor.chain().focus().toggleMark('subscript').run()}
                    title="Subscript"
                >
                    <Subscript className="h-3.5 w-3.5" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Align */}
            <div className="flex items-center gap-0.5">
                <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="h-3.5 w-3.5" /></Button>
                <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="h-3.5 w-3.5" /></Button>
                <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="h-3.5 w-3.5" /></Button>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {/* Color */}
            <Input
                type="color"
                className="h-6 w-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(e) => setColor(e.target.value)}
                title="Text Color"
            />

        </div>
    )
}
