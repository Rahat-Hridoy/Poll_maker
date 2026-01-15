"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { CanvasElement, ElementType } from "./slide-canvas"
import { Slide } from "@/lib/data"

export function useSlideEditor(initialSlide: Slide | null) {
    const [elements, setElements] = useState<CanvasElement[]>([])
    const [clipboard, setClipboard] = useState<CanvasElement | null>(null)
    const [history, setHistory] = useState<{ past: CanvasElement[][], future: CanvasElement[][] }>({ past: [], future: [] })
    const [zoom, setZoom] = useState(1)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const loadedRef = useRef<{ id: string, content: string } | null>(null)

    // Load elements from slide content
    useEffect(() => {
        if (!initialSlide) return

        const contentStr = initialSlide.content || "[]"

        // Skip if this slide ID + content is already what we have loaded
        if (loadedRef.current?.id === initialSlide.id && loadedRef.current?.content === contentStr) {
            return
        }

        try {
            let parsed = JSON.parse(contentStr)

            // Ensure parsed content is an array
            if (!Array.isArray(parsed)) {
                console.warn("Slide content is not an array, defaulting to empty elements", parsed)
                parsed = []
            }

            const nextStr = JSON.stringify(parsed)

            // Update ref immediately to the incoming string to avoid re-triggering
            loadedRef.current = { id: initialSlide.id, content: contentStr }

            // Only update elements if their content representation changed
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setElements(prev => {
                if (JSON.stringify(prev) === nextStr) return prev
                return parsed
            })

            // Only clear history if it's a completely different slide ID
            if (loadedRef.current?.id !== initialSlide.id) {
                setHistory({ past: [], future: [] })
            }
        } catch (e) {
            console.error("Failed to parse slide content", e)
            setElements([])
            loadedRef.current = { id: initialSlide.id, content: "[]" }
        }
    }, [initialSlide?.id, initialSlide?.content])

    // Update elements and save history
    const updateElements = useCallback((newElements: CanvasElement[], save = true) => {
        setElements(prev => {
            if (save) {
                setHistory(hp => ({
                    past: [...hp.past, prev],
                    future: []
                }))
            }
            return newElements
        })
    }, [])

    const undo = useCallback(() => {
        if (history.past.length === 0) return
        const previous = history.past[history.past.length - 1]
        const newPast = history.past.slice(0, -1)

        setHistory(prev => ({
            past: newPast,
            future: [elements, ...prev.future]
        }))
        setElements(previous)
    }, [history, elements])

    const redo = useCallback(() => {
        if (history.future.length === 0) return
        const next = history.future[0]
        const newFuture = history.future.slice(1)

        setHistory(prev => ({
            past: [...prev.past, elements],
            future: newFuture
        }))
        setElements(next)
    }, [history, elements])

    const addElement = useCallback((type: ElementType, initialContent?: string) => {
        const isLine = type === 'line' || type === 'arrow-line' || type.includes('wave')
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 300 : isLine ? 300 : 150,
            height: type === 'text' ? 100 : isLine ? 100 : 150,
            content: initialContent || (type === 'text' ? 'Double click to edit text...' : ''),
            rotation: 0,
            style: {
                backgroundColor: ['rect', 'circle', 'triangle', 'star', 'polygon'].includes(type) ? '#3b82f6' : 'transparent',
                borderRadius: type === 'circle' ? '50%' : '0px',
                border: type === 'text' ? '1px dashed rgba(0,0,0,0.2)' : 'none',
                fontSize: '24px',
                color: '#000000',
                borderWidth: isLine ? '2' : '0',
                borderColor: isLine ? '#3b82f6' : 'transparent',
                textAlign: 'left',
                borderStyle: 'solid',
                stroke: isLine ? '#3b82f6' : 'none',
                strokeWidth: isLine ? '2' : '0',
            }
        }
        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, updateElements])

    const addPollElement = useCallback((pollId: string, pollTitle: string) => {
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type: 'poll' as any,
            x: 100,
            y: 100,
            width: 400,
            height: 300,
            content: JSON.stringify({ pollId, title: pollTitle }),
            rotation: 0,
            style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: '#0f172a'
            }
        }
        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, updateElements])

    const addPollQRCode = useCallback((shortCode: string, pollTitle: string) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.origin + '/poll/' + shortCode)}`
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type: 'qr-code' as any,
            x: 200,
            y: 200,
            width: 250,
            height: 250,
            content: JSON.stringify({ qrUrl, title: pollTitle, shortCode }),
            rotation: 0,
            style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px'
            }
        }
        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, updateElements])

    const removeElement = useCallback((id: string) => {
        updateElements(elements.filter(el => el.id !== id))
        if (selectedId === id) setSelectedId(null)
    }, [elements, selectedId, updateElements])

    const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
    }, [])

    const updateElementAndSave = useCallback((id: string, updates: Partial<CanvasElement>) => {
        updateElements(elements.map(el => el.id === id ? { ...el, ...updates } : el))
    }, [elements, updateElements])

    const duplicateElement = useCallback(() => {
        if (!selectedId) return
        const el = elements.find(e => e.id === selectedId)
        if (!el) return

        const newEl: CanvasElement = {
            ...el,
            id: crypto.randomUUID(),
            x: el.x + 20,
            y: el.y + 20
        }
        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, selectedId, updateElements])

    const handleArrange = useCallback((action: 'front' | 'back' | 'center-h' | 'center-v') => {
        if (!selectedId) return
        const elIndex = elements.findIndex(e => e.id === selectedId)
        if (elIndex === -1) return

        const newElements = [...elements]

        if (action === 'front') {
            const [el] = newElements.splice(elIndex, 1)
            newElements.push(el)
        } else if (action === 'back') {
            const [el] = newElements.splice(elIndex, 1)
            newElements.unshift(el)
        } else if (action === 'center-h') {
            newElements[elIndex].x = (960 - newElements[elIndex].width) / 2
        } else if (action === 'center-v') {
            newElements[elIndex].y = (540 - newElements[elIndex].height) / 2
        }

        updateElements(newElements)
    }, [elements, selectedId, updateElements])

    const handleClipboard = useCallback((action: 'copy' | 'paste' | 'cut') => {
        if (action === 'copy' || action === 'cut') {
            if (!selectedId) return
            const el = elements.find(e => e.id === selectedId)
            if (el) {
                setClipboard(el)
                if (action === 'cut') {
                    removeElement(selectedId)
                }
            }
        } else if (action === 'paste') {
            if (!clipboard) return
            const newEl: CanvasElement = {
                ...clipboard,
                id: crypto.randomUUID(),
                x: clipboard.x + 20,
                y: clipboard.y + 20
            }
            updateElements([...elements, newEl])
            setSelectedId(newEl.id)
        }
    }, [elements, selectedId, clipboard, updateElements, removeElement])

    return {
        elements,
        selectedId,
        setSelectedId,
        zoom,
        setZoom,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        addElement,
        updateElement,
        updateElementAndSave,
        removeElement,
        duplicateElement,
        handleArrange,
        handleClipboard,
        addPollElement,
        addPollQRCode,
        undo,
        redo,
        setElements: updateElements
    }
}
