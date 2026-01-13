"use client"

import { useState, useEffect } from "react"
import { getPollAction } from "@/app/actions"
import { Poll } from "@/lib/data"
import { BarChart3, Loader2, Users } from "lucide-react"

interface SlidePollElementProps {
    pollId: string
    title: string
}

export function SlidePollElement({ pollId, title }: SlidePollElementProps) {
    const [poll, setPoll] = useState<Poll | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const fetchPollData = async () => {
            try {
                const data = await getPollAction(pollId)
                if (isMounted && data) {
                    setPoll(data)
                }
            } catch (error) {
                console.error("Failed to fetch poll data in slide editor:", error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchPollData()
        const interval = setInterval(fetchPollData, 2000) // Poll every 2 seconds for live updates

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [pollId])

    if (loading && !poll) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-6 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-sm text-slate-400 font-medium">Connecting to live poll...</span>
            </div>
        )
    }

    if (!poll) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <p className="text-slate-400 text-sm italic">Poll not found or deleted</p>
            </div>
        )
    }

    // Use the first question as the primary visualization
    const mainQuestion = poll.questions[0]
    const totalVotes = mainQuestion?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0

    return (
        <div className="w-full h-full p-5 flex flex-col bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live Results</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full text-[10px] font-medium text-slate-500 border border-slate-100">
                    <Users className="w-3 h-3" />
                    <span>{poll.totalVotes || 0} votes</span>
                </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-slate-800 mb-4 line-clamp-2 leading-tight">
                {mainQuestion?.text || poll.title}
            </h4>

            {/* Results */}
            <div className="flex-1 overflow-hidden space-y-3">
                {mainQuestion?.options.map((option, idx) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                    const colors = [
                        'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500'
                    ]
                    const colorClass = colors[idx % colors.length]

                    return (
                        <div key={option.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] font-medium px-0.5">
                                <span className="text-slate-600 truncate mr-2">{option.text}</span>
                                <span className="text-slate-900">{Math.round(percentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                <div
                                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-medium">Real-time syncing enabled</span>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Live</span>
                </div>
            </div>
        </div>
    )
}
