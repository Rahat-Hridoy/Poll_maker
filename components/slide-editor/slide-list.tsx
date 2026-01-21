import { Slide } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, Trash, GripVertical, MoreVertical, Copy, MessageSquare, EyeOff, RotateCcw, FilePlus, Eye } from "lucide-react"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SlideListProps {
    slides: Slide[]
    activeSlideId: string | null
    aspectRatio?: '16:9' | '4:3' | '1:1'
    onSelect: (id: string) => void
    onAdd: () => void
    onDelete: (id: string) => void
    onDuplicate?: (id: string) => void
    onUpdate?: (id: string, updates: Partial<Slide>) => void
    onReorder: (slides: Slide[]) => void
}

function SortableSlideItem({ slide, index, isActive, onSelect, onDelete, onDuplicate, onUpdate, onAdd, aspectRatio }: any) {
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

    const handleAction = (action: string) => {
        switch (action) {
            case 'new':
                onAdd();
                break;
            case 'duplicate':
                onDuplicate && onDuplicate(slide.id);
                break;
            case 'comment':
                // Simple prompt for now as requested "active functionality"
                const comment = window.prompt("Add a comment to this slide:");
                if (comment && onUpdate) {
                   const existingComments = slide.comments || [];
                   onUpdate(slide.id, { 
                       comments: [...existingComments, { 
                           id: crypto.randomUUID(), 
                           text: comment, 
                           createdAt: new Date().toISOString() 
                       }] 
                   });
                }
                break;
            case 'copy':
                // Copy to clipboard
                navigator.clipboard.writeText(JSON.stringify(slide));
                // Optional: Show toast
                break;
            case 'skip':
                onUpdate && onUpdate(slide.id, { hidden: !slide.hidden });
                break;
            case 'reset':
                if (confirm("Are you sure you want to reset this slide?")) {
                    onUpdate && onUpdate(slide.id, { content: '[]', background: '#ffffff' });
                }
                break;
            case 'delete':
                if (confirm("Delete this slide?")) {
                    onDelete(slide.id);
                }
                break;
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group mb-3">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100!" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div
                onClick={() => onSelect(slide.id)}
                className={cn(
                    "ml-6 mr-2 bg-muted/20 rounded border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center text-[10px] text-muted-foreground select-none hover:border-primary/50",
                    isActive ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-transparent shadow-sm hover:shadow",
                    slide.hidden && "opacity-50 grayscale"
                )}
                style={{
                    aspectRatio: aspectRatio?.replace(':', '/') || '16/9'
                }}
            >
                {/* Live Preview */}
                <div className="w-full h-full pointer-events-none">
                    <SlideRenderer
                        slide={slide}
                        width={180}
                        height={(1000 * parseInt((aspectRatio || '16:9').split(':')[1])) / parseInt((aspectRatio || '16:9').split(':')[0])}
                        scale={undefined}
                    />
                </div>
                
                {slide.hidden && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <EyeOff className="w-8 h-8 text-slate-500 opacity-50" />
                    </div>
                )}
                
                {slide.comments && slide.comments.length > 0 && (
                     <div className="absolute top-1 left-1 bg-yellow-100 text-yellow-600 rounded-full p-1 shadow-sm">
                        <MessageSquare className="w-3 h-3" />
                     </div>
                )}
            </div>

            <div className="absolute top-1 left-2 text-xs font-mono text-muted-foreground w-4 text-center">
                {index + 1}
            </div>

            <div className="absolute top-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-slate-200" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" className="w-48">
                         <DropdownMenuItem onClick={() => handleAction('new')}>
                            <Plus className="w-4 h-4 mr-2" /> New Slide
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                            <Copy className="w-4 h-4 mr-2" /> Duplicate Slide
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('comment')}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Add Comment
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleAction('copy')}>
                            <FilePlus className="w-4 h-4 mr-2" /> Copy to...
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('skip')}>
                            {slide.hidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />} 
                            {slide.hidden ? 'Show Slide' : 'Skip Slide'}
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleAction('reset')}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Reset Slide
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('delete')} className="text-red-600 focus:text-red-600">
                            <Trash className="w-4 h-4 mr-2" /> Delete Slide
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function SlideList({ slides, activeSlideId, onSelect, onAdd, onDelete, onDuplicate, onUpdate, onReorder, aspectRatio = '16:9' }: SlideListProps) {
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
            <div className="p-4 border-b flex items-center justify-between bg-white">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slides ({slides.length})</h3>
                <Button variant="ghost" size="icon" onClick={onAdd} className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-start space-y-2">
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
                                onDuplicate={onDuplicate}
                                onUpdate={onUpdate}
                                onAdd={onAdd}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                
                <div className="pt-4 flex justify-center">
                    <Button variant="outline" size="sm" onClick={onAdd} className="w-full border-dashed border-2">
                        <Plus className="w-4 h-4 mr-2" /> New Slide
                    </Button>
                </div>
            </div>
        </div>
    )
}
