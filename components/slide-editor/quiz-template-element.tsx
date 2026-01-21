"use client"

import { Trophy, HelpCircle, CheckCircle2, QrCode as QRIcon, Smartphone } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface QuizOption {
    id: string
    text: string
    isCorrect: boolean
    color?: string
}

interface QuizTemplateData {
    question: string
    options: QuizOption[]
    questionImage?: string
    layout?: 'vertical' | 'horizontal-left' | 'horizontal-right' | 'split-left'
    showCode?: boolean
    showQR?: boolean
}

interface QuizTemplateElementProps {
    data: QuizTemplateData
    shortCode?: string
    interactive?: boolean
    hasVoted?: boolean
    showResults?: boolean
}

export function QuizTemplateElement({ data, shortCode = "123456", interactive = false, hasVoted = false, showResults = true }: QuizTemplateElementProps) {
    const { question, options, questionImage } = data
    const layout = data.layout || 'vertical'
    const showCode = data.showCode !== false
    const showQR = data.showQR !== false

    const displayQuestion = question || "What is the answer to this question?"
    const displayOptions = options?.length > 0 ? options : [
        { id: "1", text: "Answer Option A", isCorrect: false },
        { id: "2", text: "Answer Option B (Correct)", isCorrect: true },
        { id: "3", text: "Answer Option C", isCorrect: false },
        { id: "4", text: "Answer Option D", isCorrect: false },
    ]

    function HeaderSection() {
        return (
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-5 py-2.5 rounded-xl">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Live Quiz</span>
                </div>

                {showCode && (
                    <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">Join at </span>
                            <span className="text-sm font-bold text-slate-900">poll.com</span>
                        </div>
                        <div className="h-4 w-px bg-slate-300" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Code:</span>
                            <span className="text-xl font-bold text-orange-600 tracking-wide">{shortCode}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    function ImageSection() {
        if (!questionImage) return null
        return (
            <div className="w-full h-full min-h-[200px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group bg-slate-50">
                <img
                    src={questionImage}
                    alt="Question"
                    className="w-full h-full object-cover"
                />
            </div>
        )
    }

    function OptionsSection({ columns = 2 }: { columns?: 1 | 2 }) {
        return (
            <div className={`grid gap-4 w-full h-full content-start items-stretch ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {displayOptions.map((opt, idx) => (
                    <div
                        key={opt.id || idx}
                        className={`
                            relative flex items-center px-6 py-4 rounded-xl border-2 transition-all group
                            ${// Logic for styling:
                            showResults && (!interactive || hasVoted) && opt.isCorrect
                                ? 'bg-green-50 border-green-500/50'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                            }
                        `}
                    >
                        <div className={`
                            w-8 h-8 shrink-0 flex items-center justify-center rounded-full border-2 mr-4 text-sm font-bold
                            ${showResults && (!interactive || hasVoted) && opt.isCorrect
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:border-blue-400 group-hover:text-blue-500'}
                        `}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg font-semibold leading-tight ${showResults && (!interactive || hasVoted) && opt.isCorrect ? 'text-green-900' : 'text-slate-700'}`}>
                            {opt.text}
                        </span>

                        {showResults && (!interactive || hasVoted) && opt.isCorrect && (
                            <div className="absolute top-2 right-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    function QrOrInstructions() {
        if (!showQR) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <HelpCircle className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Waiting for answers...</p>
                </div>
            )
        }
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm aspect-square">
                <div className="bg-white p-2 rounded-xl mb-3">
                    <QRCodeSVG
                        value={`https://poll.com/join/${shortCode}`}
                        size={120}
                        level="H"
                        className="w-full h-full"
                    />
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <QRIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Scan to Join</span>
                </div>
            </div>
        )
    }

    /* --- LAYOUTS --- */

    // 1. Vertical (Standard)
    if (layout === 'vertical') {
        return (
            <div className="w-full h-full flex flex-col p-8 bg-white overflow-hidden">
                <HeaderSection />

                <h1 className="text-4xl font-bold text-slate-900 mb-8 leading-snug shrink-0">
                    {displayQuestion}
                </h1>

                {questionImage && (
                    <div className="mb-8 aspect-video w-full max-w-2xl mx-auto shrink-0 shadow-md rounded-2xl overflow-hidden">
                        <img src={questionImage} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex-1 min-h-0 w-full">
                    <OptionsSection columns={2} />
                </div>
            </div>
        )
    }

    // 2. Horizontal Left (Image Left, Options Right)
    if (layout === 'horizontal-left') {
        return (
            <div className="w-full h-full flex flex-col p-8 bg-white overflow-hidden">
                <HeaderSection />

                <div className="flex-1 flex gap-8 min-h-0">
                    <div className="w-1/2 flex flex-col">
                        <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                            {displayQuestion}
                        </h1>
                        <div className="flex-1 min-h-0">
                            {questionImage ? <ImageSection /> : <QrOrInstructions />}
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col h-full bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <OptionsSection columns={1} />
                    </div>
                </div>
            </div>
        )
    }

    // 3. Horizontal Right (Options Left, Image Right)
    if (layout === 'horizontal-right') {
        return (
            <div className="w-full h-full flex flex-col p-8 bg-white overflow-hidden">
                <HeaderSection />

                <div className="flex-1 flex gap-8 min-h-0">
                    <div className="w-1/2 flex flex-col h-full bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <OptionsSection columns={1} />
                    </div>
                    <div className="w-1/2 flex flex-col">
                        <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                            {displayQuestion}
                        </h1>
                        <div className="flex-1 min-h-0">
                            {questionImage ? <ImageSection /> : <QrOrInstructions />}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 4. Split Left (Dark sidebar left)
    if (layout === 'split-left') {
        return (
            <div className="w-full h-full flex bg-white overflow-hidden">
                <div className="w-1/3 bg-slate-900 text-white p-8 flex flex-col">
                    <div className="flex items-center gap-2 text-orange-400 mb-8">
                        <Trophy className="w-6 h-6" />
                        <span className="font-bold tracking-widest uppercase text-sm">Quiz</span>
                    </div>

                    <h1 className="text-2xl font-bold leading-tight mb-8 text-slate-50/90">
                        {displayQuestion}
                    </h1>

                    <div className="mt-auto pt-8 border-t border-slate-800">
                        {showQR && (
                            <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto mb-4">
                                <QRCodeSVG value={`https://poll.com/join/${shortCode}`} size={100} className="w-full h-full" />
                            </div>
                        )}
                        {showCode && (
                            <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Join Code</div>
                                <div className="text-3xl font-bold text-orange-500 tracking-widest">{shortCode}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col bg-slate-50">
                    <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full justify-center">
                        {questionImage && (
                            <div className="h-64 w-full rounded-2xl overflow-hidden shadow-sm shrink-0">
                                <img src={questionImage} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1">
                            <OptionsSection columns={2} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
