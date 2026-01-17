"use client"

import { Slide } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Trash, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SlideRenderer } from "./slide-renderer"

interface SlideListProps {
    slides: Slide[]
    activeSlideId: string | null
    aspectRatio?: '16:9' | '4:3' | '1:1'
    onSelect: (id: string) => void
    onAdd: () => void
    onDelete: (id: string) => void
    onReorder: (slides: Slide[]) => void
}

function SortableSlideItem({ slide, index, isActive, onSelect, onDelete, aspectRatio }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group mb-3">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100!" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div
                onClick={() => onSelect(slide.id)}
                className={cn(
                    "ml-6 mr-2 bg-muted/20 rounded border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center text-[10px] text-muted-foreground select-none hover:border-primary/50",
                    isActive ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-transparent shadow-sm hover:shadow"
                )}
                style={{
                    aspectRatio: aspectRatio?.replace(':', '/') || '16/9'
                }}
            >
                {/* Live Preview */}
                <div className="w-full h-full pointer-events-none">
                    <SlideRenderer
                        slide={slide}
                        width={180} // Reduced width to prevent clipping with scrollbar
                        height={(1000 * parseInt((aspectRatio || '16:9').split(':')[1])) / parseInt((aspectRatio || '16:9').split(':')[0])}
                        scale={undefined} // Let renderer calc scale based on width
                    />
                </div>
            </div>

            <div className="absolute top-1 left-2 text-xs font-mono text-muted-foreground w-4 text-center">
                {index + 1}
            </div>

            <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(slide.id)
                }}
            >
                <Trash className="w-3 h-3" />
            </Button>
        </div>
    );
}

export function SlideList({ slides, activeSlideId, onSelect, onAdd, onDelete, onReorder, aspectRatio = '16:9' }: SlideListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = slides.findIndex((s) => s.id === active.id);
            const newIndex = slides.findIndex((s) => s.id === over?.id);
            onReorder(arrayMove(slides, oldIndex, newIndex));
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slides</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-start">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={slides.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {slides.map((slide, index) => (
                            <SortableSlideItem
                                key={slide.id}
                                slide={slide}
                                index={index}
                                isActive={slide.id === activeSlideId}
                                aspectRatio={aspectRatio}
                                onSelect={onSelect}
                                onDelete={onDelete}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    )
}
