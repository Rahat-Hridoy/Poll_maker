"use client"

import { useState, useEffect, useCallback } from "react"
import { CanvasElement, ElementType } from "./slide-canvas"
import { Slide } from "@/lib/data"

export function useSlideEditor(initialSlide: Slide | null) {
    const [elements, setElements] = useState<CanvasElement[]>([])
    const [clipboard, setClipboard] = useState<CanvasElement | null>(null)
    const [history, setHistory] = useState<{ past: CanvasElement[][], future: CanvasElement[][] }>({ past: [], future: [] })
    const [zoom, setZoom] = useState(1)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Load elements from slide content
    useEffect(() => {
        if (!initialSlide) return
        try {
            if (initialSlide.content && initialSlide.content.startsWith('[')) {
                setElements(JSON.parse(initialSlide.content))
                // Clear history when switching slides? Or keep it? 
                // Usually better to clear or manage per slide, but for now simple reset is safer
                setHistory({ past: [], future: [] })
            } else {
                setElements([])
                setHistory({ past: [], future: [] })

            }
        } catch (e) {
            console.error("Failed to parse slide content", e)
            setElements([])
        }
    }, [initialSlide?.id, initialSlide?.content]) // simplified dep check

    const saveHistory = useCallback((currentElements: CanvasElement[]) => {
        setHistory(prev => ({
            past: [...prev.past, currentElements],
            future: []
        }))
    }, [])

    // Update elements and save history
    const updateElements = useCallback((newElements: CanvasElement[], save = true) => {
        if (save) {
            setHistory(prev => ({
                past: [...prev.past, elements],
                future: []
            }))
        }
        setElements(newElements)
    }, [elements])

    const undo = useCallback(() => {
        if (history.past.length === 0) return
        const previous = history.past[history.past.length - 1]
        const newPast = history.past.slice(0, -1)

        setHistory({
            past: newPast,
            future: [elements, ...history.future]
        })
        setElements(previous)
    }, [history, elements])

    const redo = useCallback(() => {
        if (history.future.length === 0) return
        const next = history.future[0]
        const newFuture = history.future.slice(1)

        setHistory({
            past: [...history.past, elements],
            future: newFuture
        })
        setElements(next)
    }, [history, elements])

    const addElement = useCallback((type: ElementType) => {
        const newEl: CanvasElement = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 300 : 150,
            height: type === 'text' ? 100 : 150,
            content: type === 'text' ? 'Double click to edit text...' : '',
            style: {
                backgroundColor: type === 'rect' ? '#3b82f6' : type === 'circle' ? '#ef4444' : 'transparent',
                borderRadius: type === 'circle' ? '50%' : '0px',
                border: type === 'text' ? '1px dashed rgba(0,0,0,0.2)' : 'none',
                fontSize: '24px',
                color: '#000000',
                borderWidth: '0px',
                borderColor: 'transparent',
                textAlign: 'left',
            }
        }
        updateElements([...elements, newEl])
        setSelectedId(newEl.id)
    }, [elements, updateElements])

    const removeElement = useCallback((id: string) => {
        const newElements = elements.filter(el => el.id !== id)
        updateElements(newElements)
        if (selectedId === id) setSelectedId(null)
    }, [elements, selectedId, updateElements])

    const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => {
            // We don't save history for every drag frame, so we might need a separate mechanism for drag end
            // But for this simple port, let's just update. 
            // Note: pure state update doesn't trigger history save automatically here unless we use updateElements wrapper.
            // If we use setElements directly we skip history.
            return prev.map(el => el.id === id ? { ...el, ...updates } : el)
        })
    }, [])

    const updateElementAndSave = useCallback((id: string, updates: Partial<CanvasElement>) => {
        const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el)
        updateElements(newElements)
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
        updateElement, // For real-time drag (no history)
        updateElementAndSave, // For drag end / property change (history)
        removeElement,
        duplicateElement,
        handleArrange,
        handleClipboard,
        undo,
        redo,
        setElements: updateElements // Expose manual set if needed
    }
}
