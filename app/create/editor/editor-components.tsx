"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Hash, Settings, Palette, Type, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar({ side, isOpen, onToggle, children, title, icon: Icon }: {
    side: "left" | "right",
    isOpen: boolean,
    onToggle: () => void,
    children: React.ReactNode,
    title: string,
    icon: any
}) {
    return (
        <div className={cn(
            "fixed inset-y-16 z-40 flex transition-all duration-300 ease-in-out bg-card/95 backdrop-blur-md border-border",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
            isOpen ? "w-[300px] md:w-[320px]" : "w-0",
            isOpen && "w-full sm:w-[300px] md:w-[320px]"
        )}>
            {/* Toggle Button Container */}
            <div className={cn(
                "absolute top-4 z-50 transition-all",
                side === "left" ? "-right-10" : "-left-10",
                isOpen && "md:opacity-100 opacity-0 pointer-events-none md:pointer-events-auto"
            )}>
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={onToggle}
                    className="h-8 w-8 rounded-full shadow-md border border-border bg-card hover:bg-muted"
                >
                    {side === "left" ? (
                        isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : (
                        isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className={cn(
                "flex flex-col w-full h-full overflow-hidden opacity-0 transition-opacity duration-200",
                isOpen && "opacity-100 delay-100"
            )}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground uppercase tracking-wider text-xs">{title}</span>
                    </div>
                    {/* Extra close button for mobile */}
                    <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-muted-foreground" onClick={onToggle}>
                        <ChevronLeft className={cn("h-4 w-4", side === "right" && "rotate-180")} />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    )
}

export function QuestionNavItem({ index, active, onClick, text }: {
    index: number,
    active: boolean,
    onClick: () => void,
    text: string
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group text-left mb-2",
                active
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
        >
            <div className={cn(
                "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors mt-0.5",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent"
            )}>
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate leading-tight mb-0.5">
                    {text || `Question ${index + 1}`}
                </div>
                {text && (
                    <div className="text-[10px] opacity-60 truncate">
                        {text.length > 30 ? text.substring(0, 30) + "..." : "Question content"}
                    </div>
                )}
            </div>
        </button>
    )
}
