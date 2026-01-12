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


// Custom Bubble Menu implementation to bypass import issues and ensure fixed positioning
function CustomBubbleMenu({ editor, anchorEl, children }: { editor: any, anchorEl: HTMLElement | null, children: React.ReactNode }) {
    const [position, setPosition] = useState<{ top: number, left: number, placement: 'top' | 'bottom' } | null>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const updatePosition = () => {
            if (!editor || editor.isDestroyed || !editor.isEditable || !anchorEl) {
                setPosition(null)
                // We reset offset when menu kind of 'closes' to restore default behavior next time
                setOffset({ x: 0, y: 0 })
                return
            }

            const { selection } = editor.state
            if (selection.empty) {
                setPosition(null)
                setOffset({ x: 0, y: 0 })
                return
            }

            // Get the bounding rectangle of the editor element (or custom anchor)
            const rect = anchorEl.getBoundingClientRect()

            // Calculate position
            // Center horizontally relative to the element
            const left = rect.left + rect.width / 5

            // Try Top position first
            // We want the BOTTOM of the toolbar to be slightly above the element
            // We will use transform: translate(-50%, -100%) for top placement
            let top = rect.top - 1 // 5px Gap above element
            let placement: 'top' | 'bottom' = 'top'

            // If too close to viewport top, flip to Bottom
            if (top < 30) { // 60px clearance for toolbar
                top = rect.bottom + 1 // 2px Gap below element
                placement = 'bottom'
            }

            setPosition({ top, left, placement })
        }

        updatePosition()

        // Subscribe to updates
        editor.on('selectionUpdate', updatePosition)
        editor.on('update', updatePosition)
        editor.on('focus', updatePosition)
        editor.on('blur', updatePosition)

        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)

        return () => {
            editor.off('selectionUpdate', updatePosition)
            editor.off('update', updatePosition)
            editor.off('focus', updatePosition)
            editor.off('blur', updatePosition)
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [editor, anchorEl])

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent if interacting with inputs inside (like color picker or dropdowns if they don't stop prop)
        if ((e.target as HTMLElement).tagName === 'INPUT') return
        if ((e.target as HTMLElement).tagName === 'BUTTON') return // Let buttons click? Actually TextContextToolbar stops click prop, but maybe not mousedown bubbling? 
        // TextContextToolbar has onMouseDown preventDefault() but it bubbles.

        e.preventDefault()

        const startX = e.clientX
        const startY = e.clientY
        const startOffsetX = offset.x
        const startOffsetY = offset.y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX
            const dy = moveEvent.clientY - startY
            setOffset({ x: startOffsetX + dx, y: startOffsetY + dy })
        }

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    if (!position) return null

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                position: 'fixed',
                top: position.top + offset.y,
                left: position.left + offset.x,
                transform: position.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                zIndex: 9999,
                pointerEvents: 'auto',
                cursor: 'move', // Indicate draggable
            }}
        >
            {children}
        </div>
    )
}


interface SlideTextEditorProps {
    content: string
    onChange: (html: string) => void
    editable: boolean
    className?: string
    style?: React.CSSProperties
    zoom: number
}

export function SlideTextEditor({ content, onChange, editable, className, style, zoom }: SlideTextEditorProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)
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
            {editor && editable && (
                <CustomBubbleMenu editor={editor} anchorEl={containerRef.current}>
                    <TextContextToolbar editor={editor} />
                </CustomBubbleMenu>
            )}
            <div
                ref={containerRef}
                className={className}
                style={{ ...style, cursor: editable ? 'text' : 'default' }}
            >
                <EditorContent editor={editor} className="h-full w-full" />
            </div>
        </>
    )
}
