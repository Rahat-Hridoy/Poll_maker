"use client"

import { useEditor, EditorContent, Mark, mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Underline as UnderlineIcon, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'

// Custom Underline extension
const Underline = Mark.create({
    name: 'underline',
    parseHTML() { return [{ tag: 'u' }, { style: 'text-decoration: underline' }] },
    renderHTML({ HTMLAttributes }) { return ['u', mergeAttributes(HTMLAttributes), 0] },
    addKeyboardShortcuts() {
        return {
            'Mod-u': () => this.editor.commands.toggleMark(this.name),
        }
    },
})

// Custom TextStyle extension for Color
const TextStyle = Mark.create({
    name: 'textStyle',
    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: element => element.style.color?.replace(/['"]+/g, ''),
                renderHTML: attributes => {
                    if (!attributes.color) return {}
                    return { style: `color: ${attributes.color}` }
                },
            },
        }
    },
    parseHTML() {
        return [{ tag: 'span', getAttrs: element => (element as HTMLElement).style.color ? {} : false }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0]
    },
})

interface RichTextInputProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    className?: string
}

export function RichTextInput({ value, onChange, placeholder, className }: RichTextInputProps) {
    const [isFocused, setIsFocused] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[40px] px-3 py-2 text-sm',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        onFocus: () => setIsFocused(true),
        onBlur: ({ editor }) => {
            // Check if we lost focus to something outside the component?
            // For simplicity, we assume generic blur hides it. 
            // Interaction with color picker is tricky as it might technically blur.
            // But usually native color picker keeps focus or returns it.
            setIsFocused(false)
        },
    })

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            if (editor.getText() === '' && value === '') {
                editor.commands.setContent(value)
            } else if (value && value !== '<p></p>' && !editor.isFocused) {
                editor.commands.setContent(value)
            }
        }
    }, [value, editor])

    // Ensure toolbar stays visible when interacting with color picker
    // This is hard to guarantee with just basic onBlur, but we'll try to rely on state.

    if (!editor) {
        return null
    }

    return (
        <div className={`relative border rounded-md shadow-sm bg-white group focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${className}`}>

            {/* Floating Toolbar */}
            <div className={`absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-slate-800 text-white p-1 rounded-md shadow-lg transition-all z-10 ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700 text-blue-400' : ''}`}
                    title="Bold"
                    // Prevent blur when clicking buttons
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700 text-blue-400' : ''}`}
                    title="Italic"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('underline') ? 'bg-slate-700 text-blue-400' : ''}`}
                    title="Underline"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <UnderlineIcon className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-slate-600 mx-1" />

                <div className="relative flex items-center group/color">
                    <button
                        className={`p-1.5 rounded hover:bg-slate-700 ${editor.getAttributes('textStyle').color ? 'text-blue-400' : ''}`}
                        title="Text Color"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Palette className="w-3.5 h-3.5" style={{ color: editor.getAttributes('textStyle').color }} />
                    </button>
                    {/* Invisible Color Input overlay */}
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onInput={(e) => {
                            editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
                            setIsFocused(true)
                        }}
                        onFocus={() => setIsFocused(true)}
                        // Prevent blur
                        onMouseDown={(e) => {
                            // This ensures editor keeps existing selection if possible, 
                            // but color picker interactions are browser specific.
                        }}
                        defaultValue={editor.getAttributes('textStyle').color || '#000000'}
                    />
                </div>
            </div>

            <EditorContent editor={editor} className="w-full" />
            {!value && placeholder && (
                <div className="absolute top-[8px] left-3 text-slate-400 text-sm pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    )
}
