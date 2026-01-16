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
    layout?: 'vertical' | 'horizontal-left' | 'horizontal-right' | 'split-left'
}

interface PollTemplateElementProps {
    data: PollTemplateData
    onVote?: (optionId: string) => void
    hasVoted?: boolean
}

export function PollTemplateElement({ data, onVote, hasVoted }: PollTemplateElementProps) {
    const { question, options, questionImage, chartType = 'bar' } = data
    const layout = data.layout || 'vertical'

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
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="votes"
                            label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, percent = 0, index }) => {
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
                            align="right"
                            wrapperStyle={{ paddingLeft: "10px", maxWidth: "40%" }}
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                        {payload?.map((entry: any, index: any) => (
                                            <div key={`item-${index}`} className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                                                <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: entry.color }} />
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
                    layout="horizontal"
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
                                        width="100%"
                                        height="100%"
                                        preserveAspectRatio="xMidYMid slice"
                                    />
                                </pattern>
                            ) : null
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 14, fontWeight: 600, fill: '#334155' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickLine={false}
                        dy={10}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickLine={false}
                        allowDecimals={false}
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
                                        x={x + (props.width / 2)}
                                        y={y - 10}
                                        textAnchor="middle"
                                        fill="#475569"
                                        fontSize={14}
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

    const HeaderSection = () => (
        !onVote ? (
            <div className="flex items-center justify-between mb-4 w-full">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Live Poll</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{totalVotes} responses</span>
                </div>
            </div>
        ) : null
    )

    const ImageSection = ({ className = "" }: { className?: string }) => (
        questionImage ? (
            <div className={`flex justify-center shrink-0 ${className}`}>
                <img
                    src={questionImage}
                    alt="Question Reference"
                    className="h-full w-full object-contain rounded-lg shadow-sm border border-slate-100 max-h-full"
                />
            </div>
        ) : null
    )

    const CONTENT_AREA_CLASS = "flex-1 w-full relative p-4 min-h-0 overflow-y-auto"

    const VotingOrChart = () => (
        <div className={CONTENT_AREA_CLASS}>
            {onVote ? (
                <div className="space-y-4 max-w-2xl mx-auto w-full">
                    {hasVoted ? (
                        <div className="text-center py-12 bg-green-50 rounded-2xl border-2 border-green-100 animate-in fade-in zoom-in duration-300">
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <Users className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-green-800 mb-2">Vote Submitted!</h3>
                            <p className="text-green-600 font-medium">Thank you for participating.</p>
                        </div>
                    ) : (
                        displayOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => onVote && onVote(opt.id)}
                                className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all font-bold text-lg text-slate-700 flex justify-between items-center group active:scale-[0.99]"
                            >
                                <span>{opt.text}</span>
                                <div className="h-6 w-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            ) : renderChart()}
        </div>
    )

    // Layout Specific Renders
    if (layout === 'split-left') {
        return (
            <div className="w-full h-full p-4 flex gap-4 bg-white overflow-hidden select-none">
                {/* Left Side: Full Image */}
                <div className="w-1/2 h-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                    {questionImage ? (
                        <img src={questionImage} alt="Topic" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BarChart3 className="w-20 h-20 opacity-20" />
                        </div>
                    )}
                </div>
                {/* Right Side: Content */}
                <div className="w-1/2 flex flex-col h-full">
                    <HeaderSection />
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight text-center mb-6">
                            {displayQuestion}
                        </h1>
                        <div className="flex-1 min-h-0 w-full flex flex-col">
                            <VotingOrChart />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (layout === 'horizontal-left' || layout === 'horizontal-right') {
        const isImageLeft = layout === 'horizontal-left'
        return (
            <div className="w-full h-full p-8 flex flex-col bg-white overflow-hidden select-none">
                <HeaderSection />

                {/* Top Section: Image and Question side-by-side */}
                <div className={`flex w-full gap-6 mb-6 h-[40%] shrink-0 ${isImageLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Image Side */}
                    {questionImage ? (
                        <div className="w-1/3 h-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-2 shadow-sm">
                            <img src={questionImage} alt="Topic" className="max-w-full max-h-full object-contain rounded-lg" />
                        </div>
                    ) : (
                        // Placeholder for layout consistency
                        <div className="w-1/3 h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-2">
                            <span className="text-slate-400 text-sm font-medium">No Image</span>
                        </div>
                    )}

                    {/* Question Side */}
                    <div className="flex-1 h-full flex items-center justify-center p-6 bg-slate-50/50 rounded-xl border border-slate-100/50">
                        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight text-center overflow-y-auto max-h-full flex items-center">
                            {displayQuestion}
                        </h1>
                    </div>
                </div>

                {/* Bottom Section: Options / Chart */}
                <div className="flex-1 w-full min-h-0 relative flex flex-col">
                    <VotingOrChart />
                </div>
            </div>
        )
    }

    // Default Vertical Layout
    return (
        <div className="w-full h-full p-8 flex flex-col bg-white overflow-hidden select-none">
            <HeaderSection />
            {questionImage && (
                <div className="w-full max-h-[30%] mb-4 flex justify-center shrink-0">
                    <ImageSection className="h-full" />
                </div>
            )}
            <h1 className={`${questionImage ? 'text-3xl mb-4' : 'text-4xl mb-8'} font-extrabold text-slate-900 leading-tight text-center transition-all`}>
                {displayQuestion}
            </h1>
            <VotingOrChart />
        </div>
    )
}
