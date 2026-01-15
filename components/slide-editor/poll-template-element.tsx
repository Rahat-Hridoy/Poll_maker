"use client"

import { BarChart3, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid, PieChart, Pie, Legend } from 'recharts'

interface PollOption {
    id: string
    text: string
    votes: number
    color?: string
    image?: string
}

interface PollTemplateData {
    question: string
    options: PollOption[]
    showResults?: boolean
    questionImage?: string
    chartType?: 'bar' | 'pie'
}

interface PollTemplateElementProps {
    data: PollTemplateData
}

export function PollTemplateElement({ data }: PollTemplateElementProps) {
    const { question, options, questionImage, chartType = 'bar' } = data

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
        id: opt.id || idx.toString(),
        name: opt.text,
        votes: opt.votes || 0,
        color: opt.color && opt.color.startsWith('#') ? opt.color : defaultColors[idx % defaultColors.length],
        image: opt.image,
        percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
    }))

    const renderChart = () => {
        if (chartType === 'pie') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="60%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="votes"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return percent > 0 ? (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-shadow-sm pointer-events-none select-none text-xl">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                ) : null;
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
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
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="left"
                            wrapperStyle={{ paddingLeft: "20px", maxWidth: "40%" }}
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-col gap-4">
                                        {payload?.map((entry: any, index: any) => (
                                            <div key={`item-${index}`} className="flex items-center gap-3 text-slate-700 font-semibold text-lg">
                                                <div className="w-5 h-5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: entry.color }} />
                                                <span className="truncate">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                    barSize={80}
                >
                    <defs>
                        {chartData.map((entry) => (
                            entry.image ? (
                                <pattern
                                    key={`pattern-${entry.id}`}
                                    id={`pattern-${entry.id}`}
                                    patternUnits="objectBoundingBox"
                                    width="1"
                                    height="1"
                                >
                                    <image
                                        href={entry.image}
                                        x="0"
                                        y="0"
                                        width="100%" // Stretch to fit the bar width
                                        height="100%" // Stretch to fit the bar height
                                        preserveAspectRatio="xMidYMid slice" // Crop to cover
                                    />
                                </pattern>
                            ) : null
                        ))}
                    </defs>
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
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.image ? `url(#pattern-${entry.id})` : entry.color}
                            />
                        ))}
                        <LabelList
                            dataKey="percentage"
                            position="top"
                            content={(props: any) => {
                                const { x, y, value, index } = props;
                                const voteCount = chartData[index].votes;
                                return (
                                    <text
                                        x={x + (props.width / 2)} // Center properly using width
                                        y={y - 10}
                                        textAnchor="middle"
                                        fill="#475569"
                                        fontSize={16}
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
        )
    }

    return (
        <div className="w-full h-full p-8 flex flex-col bg-white overflow-hidden select-none">
            {/* Header / Meta */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Live Poll</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{totalVotes} responses</span>
                </div>
            </div>

            {/* Question Image (Adaptive Layout) */}
            {questionImage && (
                <div className="w-full max-h-[30%] mb-4 flex justify-center shrink-0">
                    <img
                        src={questionImage}
                        alt="Question Reference"
                        className="h-full object-contain rounded-lg shadow-sm border border-slate-100"
                    />
                </div>
            )}

            {/* Question Title */}
            <h1 className={`${questionImage ? 'text-3xl mb-4' : 'text-4xl mb-8'} font-extrabold text-slate-900 leading-tight text-center transition-all`}>
                {displayQuestion}
            </h1>

            {/* Chart Area */}
            <div className="flex-1 w-full relative p-4 min-h-0">
                {renderChart()}
            </div>
        </div>
    )
}
