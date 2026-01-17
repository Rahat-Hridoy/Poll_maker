"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, MonitorPlay, MoreVertical, Trash, Edit, ExternalLink, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Presentation } from "@/lib/data"
import { fetchPresentations, createPresentationAction, deletePresentationAction } from "@/app/actions/presentation"

export default function SlideDashboard() {
    const [presentations, setPresentations] = useState<Presentation[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadPresentations()

        const onFocus = () => {
            loadPresentations()
        }

        window.addEventListener("focus", onFocus)
        return () => window.removeEventListener("focus", onFocus)
    }, [])

    async function loadPresentations() {
        try {
            const data = await fetchPresentations()
            setPresentations(data)
        } catch (error) {
            console.error("Failed to load presentations", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate() {
        try {
            const newPres = await createPresentationAction("New Presentation")
            setPresentations(prev => [newPres, ...prev])
            window.open(`/editor/${newPres.id}`, '_blank')
        } catch (error) {
            console.error("Failed to create presentation", error)
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Are you sure you want to delete this presentation?")) {
            await deletePresentationAction(id)
            setPresentations(prev => prev.filter(p => p.id !== id))
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading presentations...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Slides</h1>
                    <p className="text-muted-foreground mt-1">Manage your presentations and slide decks.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Presentation
                </Button>
            </div>

            {presentations.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
                    <MonitorPlay className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No presentations yet</h3>
                    <p className="max-w-xs mx-auto mb-6">Create your first slide deck to start presenting your ideas.</p>
                    <Button onClick={handleCreate} variant="outline">Create Presentation</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {presentations.map((pres) => (
                        <div key={pres.id} className="group relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                            {/* Thumbnail Placeholder */}
                            <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground/30 relative overflow-hidden group-hover:bg-muted/80 transition-colors">
                                <MonitorPlay className="w-12 h-12" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={`/editor/${pres.id}`} target="_blank">
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <Edit className="w-4 h-4" /> Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/presentation/${pres.id}`} target="_blank">
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <ExternalLink className="w-4 h-4" /> Preview
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="p-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                        <Link href={`/editor/${pres.id}`} target="_blank">{pres.title}</Link>
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(pres.createdAt).toLocaleDateString()}
                                        <span className="text-muted-foreground/30">•</span>
                                        {pres.slides.length} slides
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <Link href={`/editor/${pres.id}`} target="_blank">
                                            <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={`/presentation/${pres.id}`} target="_blank">
                                            <DropdownMenuItem>
                                                <MonitorPlay className="w-4 h-4 mr-2" />
                                                Present
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem onClick={() => handleDelete(pres.id)} className="text-destructive focus:text-destructive">
                                            <Trash className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
