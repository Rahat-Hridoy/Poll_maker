"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { Presentation } from "@/lib/data"
import { Loader2, ArrowLeft, BarChart3, Users, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid, PieChart, Pie } from 'recharts'

export default function ResultsPage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPresentation()
    }, [params.id])

    // Auto-refresh logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadPresentation()
            }
        }, 2000)
        return () => clearInterval(interval)
    }, [params.id])

    async function loadPresentation() {
        if (!params.id) return
        try {
            const data = await fetchPresentation(params.id as string)
            if (data) {
                setPresentation(prev => {
                    if (!prev) return data
                    if (data.updatedAt !== prev.updatedAt) {
                        return data
                    }
                    return prev
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-slate-500 text-sm animate-pulse">Loading results...</p>
                </div>
            </div>
        )
    }

    if (!presentation) return <div className="h-screen w-screen flex items-center justify-center text-slate-500">Presentation not found</div>

    // Extract Poll Data from Slides
    const pollSlides = presentation.slides.map((slide, index) => {
        try {
            const elements = JSON.parse(slide.content)
            const pollElement = elements.find((el: any) =>
                ['poll-template', 'quiz-template', 'qa-template'].includes(el.type)
            )

            if (!pollElement) return null

            let data
            try {
                data = JSON.parse(pollElement.content)
            } catch {
                return null
            }

            return {
                slideIndex: index + 1,
                slideId: slide.id,
                type: pollElement.type,
                data
            }
        } catch {
            return null
        }
    }).filter(Boolean) as { slideIndex: number, slideId: string, type: string, data: any }[]

    const defaultColors = [
        "#3b82f6", "#a855f7", "#10b981", "#f97316", "#ec4899", "#ef4444", "#eab308", "#06b6d4"
    ]

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href={`/editor/${presentation.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Editor
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">{presentation.title}</h1>
                        <p className="text-xs text-slate-500">Poll Results Overview</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Live Updates Active
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-8">
                {pollSlides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
                        <LayoutGrid className="w-16 h-16 opacity-20" />
                        <h3 className="text-xl font-medium text-slate-600">No Polls Found</h3>
                        <p className="max-w-md text-center">Add Polls, Quizzes, or Q&A slides to your presentation to see results here.</p>
                        <Link href={`/editor/${presentation.id}`}>
                            <Button>Go to Editor</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pollSlides.map((poll) => {
                            const totalVotes = poll.data.options?.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0) || 0
                            const chartData = poll.data.options?.map((opt: any, idx: number) => ({
                                name: opt.text,
                                votes: opt.votes || 0,
                                color: opt.color && opt.color.startsWith('#') ? opt.color : defaultColors[idx % defaultColors.length],
                                percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
                            })) || []

                            return (
                                <Card key={poll.slideId} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    Slide {poll.slideIndex} • {poll.type.replace('-template', '').toUpperCase()}
                                                </div>
                                                <CardTitle className="text-lg font-bold text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: poll.data.question || poll.data.title || 'Untitled' }} />
                                            </div>
                                            <div className="bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-lg flex flex-col items-center min-w-[60px]">
                                                <span className="text-xl font-black text-slate-900 leading-none">{totalVotes}</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Votes</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[300px] p-6">
                                        {poll.type === 'qa-template' ? (
                                            <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                                                <Users className="w-10 h-10 opacity-20" />
                                                <p className="text-sm">Q&A responses are not visualized yet</p>
                                            </div>
                                        ) : chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={chartData}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    barSize={32}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                                    <XAxis type="number" hide />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        width={120}
                                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: '#f8fafc' }}
                                                        content={<CustomTooltip />}
                                                    />
                                                    <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                                                        {chartData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                        <LabelList
                                                            dataKey="votes"
                                                            position="right"
                                                            style={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }}
                                                            formatter={(val: any) => val > 0 ? val : ''}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                No data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-slate-900/90 backdrop-blur text-white text-xs py-2 px-3 rounded shadow-xl border border-white/10">
                <p className="font-bold mb-1">{data.name}</p>
                <p>{data.votes} votes ({data.percentage}%)</p>
            </div>
        )
    }
    return null
}
