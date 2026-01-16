"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, LayoutTemplate, MonitorPlay, Users, X } from "lucide-react"
import { useState } from "react"

interface PreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    presentationId: string
    title: string
}

type ViewMode = 'split' | 'presenter' | 'audience'

export function PreviewDialog({ open, onOpenChange, presentationId, title }: PreviewDialogProps) {
    const [loadingPresenter, setLoadingPresenter] = useState(true)
    const [loadingAudience, setLoadingAudience] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('split')

    // Add timestamp to force refresh when opening
    const timestamp = Date.now()

    const cycleViewMode = () => {
        if (viewMode === 'split') setViewMode('presenter')
        else if (viewMode === 'presenter') setViewMode('audience')
        else setViewMode('split')
    }

    const getViewIcon = () => {
        switch (viewMode) {
            case 'split': return <LayoutTemplate className="w-4 h-4 mr-2" />
            case 'presenter': return <MonitorPlay className="w-4 h-4 mr-2" />
            case 'audience': return <Users className="w-4 h-4 mr-2" />
        }
    }

    const getViewLabel = () => {
        switch (viewMode) {
            case 'split': return "Split View"
            case 'presenter': return "Presenter Only"
            case 'audience': return "Audience Only"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[95vw] w-[1400px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background"
                hideDefaultClose
            >
                <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">Live Preview: {title}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={cycleViewMode}
                            className="min-w-[140px]"
                        >
                            {getViewIcon()}
                            {getViewLabel()}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className={`flex-1 overflow-hidden bg-muted/20 ${viewMode === 'split' ? 'grid grid-cols-2 divide-x' : 'flex flex-col'}`}>
                    {/* Presenter View */}
                    <div className={`flex flex-col h-full relative group ${viewMode === 'audience' ? 'hidden' : 'flex-1'}`}>
                        <div className="h-8 bg-muted border-b flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Presenter View
                        </div>
                        <div className="flex-1 relative w-full h-full">
                            {loadingPresenter && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            <iframe
                                src={`/presentation/${presentationId}?preview=true&t=${timestamp}`}
                                className="w-full h-full border-0"
                                onLoad={() => setLoadingPresenter(false)}
                                allow="fullscreen; clipboard-write; encrypted-media"
                            />
                        </div>
                    </div>

                    {/* Audience View */}
                    <div className={`flex flex-col h-full relative group ${viewMode === 'presenter' ? 'hidden' : 'flex-1'}`}>
                        <div className="h-8 bg-muted border-b flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Audience View
                        </div>
                        <div className="flex-1 relative w-full h-full">
                            {loadingAudience && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            <iframe
                                src={`/view/${presentationId}?preview=true&t=${timestamp}`}
                                className="w-full h-full border-0"
                                onLoad={() => setLoadingAudience(false)}
                                allow="fullscreen; clipboard-write; encrypted-media"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
