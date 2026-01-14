"use client"

import { BarChart3, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid } from 'recharts'

interface PollOption {
    id: string
    text: string
    votes: number
    color?: string
}

interface PollTemplateData {
    question: string
    options: PollOption[]
    showResults?: boolean
}

interface PollTemplateElementProps {
    data: PollTemplateData
}

export function PollTemplateElement({ data }: PollTemplateElementProps) {
    const { question, options } = data

    // Default values if data is missing
    const displayQuestion = question || "Your Poll Question Here?"
    const displayOptions = options?.length > 0 ? options : [
        { id: "1", text: "Option A", votes: 45, color: "#3b82f6" },
        { id: "2", text: "Option B", votes: 30, color: "#a855f7" },
        { id: "3", text: "Option C", votes: 25, color: "#10b981" }
    ]

    const totalVotes = displayOptions.reduce((acc, opt) => acc + (opt.votes || 0), 0)

    // Standard hex colors matching the editor
    const defaultColors = [
        "#3b82f6", // blue
        "#a855f7", // purple
        "#10b981", // emerald
        "#f97316", // orange
        "#ec4899", // pink
        "#ef4444", // red
        "#eab308", // yellow
        "#06b6d4"  // cyan
    ]

    // Prepare data for recharts
    const chartData = displayOptions.map((opt, idx) => ({
        name: opt.text,
        votes: opt.votes || 0,
        color: opt.color && opt.color.startsWith('#') ? opt.color : defaultColors[idx % defaultColors.length],
        percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
    }))

    return (
        <div className="w-full h-full p-8 flex flex-col bg-white overflow-hidden select-none">
            {/* Header / Meta */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Live Poll</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{totalVotes} responses</span>
                </div>
            </div>

            {/* Question Title */}
            <h1 className="text-4xl font-extrabold text-slate-900 mb-8 leading-tight text-center">
                {displayQuestion}
            </h1>

            {/* Chart Area */}
            <div className="flex-1 w-full relative p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                        barSize={80}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 16, fontWeight: 600, fill: '#334155' }}
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 14, fill: '#64748b' }}
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={false}
                            allowDecimals={false}
                            label={{ value: 'Votes', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 14, fontWeight: 500 } }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 text-white text-sm py-2 px-3 rounded shadow-xl">
                                            <p className="font-bold">{data.name}</p>
                                            <p>{data.votes} votes ({data.percentage}%)</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="votes"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList
                                dataKey="percentage"
                                position="top" // Changed from "right" to "top"
                                content={(props: any) => {
                                    const { x, y, value, index } = props;
                                    const voteCount = chartData[index].votes;
                                    return (
                                        <text
                                            x={x}
                                            y={y - 10} // Adjusted y position for "top"
                                            textAnchor="middle" // Centered text
                                            fill="#475569"
                                            fontSize={16} // Slightly smaller font for top label
                                            fontWeight="bold"
                                            style={{ filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.5))' }}
                                        >
                                            {value}% ({voteCount})
                                        </text>
                                    );
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
