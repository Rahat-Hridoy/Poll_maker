"use client"

import { Trophy, HelpCircle, CheckCircle2 } from "lucide-react"

interface QuizOption {
    id: string
    text: string
    isCorrect: boolean
}

interface QuizTemplateData {
    question: string
    options: QuizOption[]
}

interface QuizTemplateElementProps {
    data: QuizTemplateData
}

export function QuizTemplateElement({ data }: QuizTemplateElementProps) {
    const { question, options } = data

    // Defaults
    const displayQuestion = question || "What is the answer to this question?"
    const displayOptions = options?.length > 0 ? options : [
        { id: "1", text: "Answer Option A", isCorrect: false },
        { id: "2", text: "Answer Option B (Correct)", isCorrect: true },
        { id: "3", text: "Answer Option C", isCorrect: false },
        { id: "4", text: "Answer Option D", isCorrect: false },
    ]

    return (
        <div className="w-full h-full flex flex-col p-10 bg-white select-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-5 py-2.5 rounded-xl">
                    <Trophy className="w-6 h-6" />
                    <span className="text-base font-bold uppercase tracking-wider">Quiz Question</span>
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <HelpCircle className="w-6 h-6" />
                </div>
            </div>

            {/* Question */}
            <h1 className="text-4xl font-bold text-slate-900 mb-12 leading-snug">
                {displayQuestion}
            </h1>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-6 flex-1 content-start">
                {displayOptions.map((opt, idx) => (
                    <div
                        key={opt.id || idx}
                        className={`
                            relative h-24 flex items-center px-8 rounded-2xl border-2 transition-all
                            ${opt.isCorrect
                                ? 'bg-green-50 border-green-500/50'
                                : 'bg-white border-slate-200'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 mr-6 text-xl font-bold
                            ${opt.isCorrect
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-500'}
                        `}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-xl font-semibold ${opt.isCorrect ? 'text-green-900' : 'text-slate-700'}`}>
                            {opt.text}
                        </span>

                        {opt.isCorrect && (
                            <div className="absolute top-3 right-3 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
