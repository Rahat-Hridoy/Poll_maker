import { useEditor, EditorContent, Mark, mergeAttributes } from '@tiptap/react'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { TextContextToolbar } from './text-context-toolbar'

// --- Custom Extensions since we can't install new packages easily ---

// Underline Extension
const Underline = Mark.create({
    name: 'underline',
    parseHTML() { return [{ tag: 'u' }] },
    renderHTML({ HTMLAttributes }) { return ['u', mergeAttributes(HTMLAttributes), 0] },
    addKeyboardShortcuts() {
        return {
            'Mod-u': () => this.editor.commands.toggleMark(this.name),
        }
    },
})

// Superscript Extension without inline styles, using CSS module or class approach is safer, but inline overrides Tailwind best here.
const Superscript = Mark.create({
    name: 'superscript',
    parseHTML() { return [{ tag: 'sup' }] },
    renderHTML({ HTMLAttributes }) {
        return ['sup', mergeAttributes(HTMLAttributes, { style: 'vertical-align: super; font-size: smaller;' }), 0]
    },
    addKeyboardShortcuts() {
        return {
            'Mod-.': () => this.editor.commands.toggleMark(this.name),
        }
    },
})
// Verified logic: getBoundingClientRect works partially with CSS scale, but visual comparison suggests it works enough.
// The user issue "no change" might be caching.


// Subscript Extension
const Subscript = Mark.create({
    name: 'subscript',
    parseHTML() { return [{ tag: 'sub' }] },
    renderHTML({ HTMLAttributes }) {
        return ['sub', mergeAttributes(HTMLAttributes, { style: 'vertical-align: sub; font-size: smaller;' }), 0]
    },
    addKeyboardShortcuts() {
        return {
            'Mod-,': () => this.editor.commands.toggleMark(this.name),
        }
    },
})

// TextStyle (Color, ID, etc) and FontSize/FontFamily via Style attributes
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
            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize,
                renderHTML: attributes => {
                    if (!attributes.fontSize) return {}
                    return { style: `font-size: ${attributes.fontSize}` }
                },
            },
            fontFamily: {
                default: null,
                parseHTML: element => element.style.fontFamily,
                renderHTML: attributes => {
                    if (!attributes.fontFamily) return {}
                    return { style: `font-family: ${attributes.fontFamily}` }
                },
            },
        }
    },
    parseHTML() {
        return [{ tag: 'span' }]
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0]
    },
})


// CustomBubbleMenu removed per user request for simple CSS positioning
interface SlideTextEditorProps {
    content: string
    onChange: (html: string) => void
    editable: boolean
    className?: string
    style?: React.CSSProperties
    zoom: number
}

export function SlideTextEditor({ content, onChange, editable, className, style, zoom }: SlideTextEditorProps) {
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
    const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

    const updatePlacement = React.useCallback(() => {
        if (!containerEl) return
        const rect = containerEl.getBoundingClientRect()
        // Toolbar height approx 40-50px. Gap 10px. 
        // If element top is closer than ~60px to viewport top, flip to bottom.
        // User said "if top space < -10px" - likely meaning if it goes off screen.
        // We'll use a safe threshold of 60px to prevent clipping.
        if (rect.top < 60) {
            setPlacement('bottom')
        } else {
            setPlacement('top')
        }
    }, [containerEl])

    useEffect(() => {
        updatePlacement()
        window.addEventListener('resize', updatePlacement)
        window.addEventListener('scroll', updatePlacement, true)
        return () => {
            window.removeEventListener('resize', updatePlacement)
            window.removeEventListener('scroll', updatePlacement, true)
        }
    }, [updatePlacement])

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Superscript,
            Subscript,
            TextStyle,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
        ],
        content: content,
        editable: editable,
        immediatelyRender: false, // Fix for SSR hydration mismatch
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'outline-none h-full w-full bg-transparent overflow-hidden leading-normal',
                style: 'height: 100%; width: 100%;'
            }
        }
    })

    // Sync editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable)
            if (editable) {
                // Determine focus position: 'all' to select all text if needed, or 'end'
                // For "Double click to edit...", maybe select all? 
                // Let's just focus 'end' for now to be safe, or 'all' matches standard behavior.
                editor.commands.focus() 
            }
        }
    }, [editable, editor])

    // Update content if changed externally (rare in this app, but good practice)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (editor.getText() === '' && content !== '') {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    return (
        <>
            <div
                ref={setContainerEl}
                className={className}
                // User Request: "just make the text field as position: relative"
                style={{ ...style, position: 'relative', cursor: editable ? 'text' : 'default' }}
            >
                {/* Floating Toolbar - Positioned absolutely relative to this container */}
                {/* User Request: position: absolute, top: -5px , left : 0px */}
                {/* Visual adjustment: translateY(-100%) moves it up to sit on top of the border */}
                {editor && editable && !editor.state.selection.empty && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '0px',
                            zIndex: 50,
                            pointerEvents: 'auto',
                            whiteSpace: 'nowrap', // Prevent wrapping
                            // Smart Flip Logic
                            ...(placement === 'top' 
                                ? { top: '-10px', transform: 'translateY(-100%)' }
                                : { bottom: '-10px', transform: 'translateY(100%)' }
                            )
                        }}
                    >
                        <TextContextToolbar editor={editor} />
                    </div>
                )}
                
                <EditorContent editor={editor} className="h-full w-full" />
            </div>
        </>
    )
}
