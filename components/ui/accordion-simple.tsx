"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
    value: string
    title: React.ReactNode
    children: React.ReactNode
    isOpen?: boolean
    onToggle?: () => void
}

export function Accordion({ children, type = "single", collapsible = true }: { children: React.ReactNode, type?: "single" | "multiple", collapsible?: boolean }) {
    const [openItem, setOpenItem] = React.useState<string | null>(null)

    const handleToggle = (value: string) => {
        setOpenItem(openItem === value ? (collapsible ? null : value) : value)
    }

    return (
        <div className="space-y-4">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        isOpen: child.props.value === openItem,
                        onToggle: () => handleToggle(child.props.value)
                    } as any)
                }
                return child
            })}
        </div>
    )
}

export function AccordionItem({ value, title, children, isOpen, onToggle }: AccordionItemProps) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    "flex w-full items-center justify-between p-4 text-left font-semibold text-foreground hover:bg-muted transition-colors",
                    isOpen && "bg-muted border-b border-border"
                )}
            >
                {title}
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="p-4 pt-2 space-y-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
