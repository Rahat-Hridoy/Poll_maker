"use client"

import { MessageSquare, QrCode } from "lucide-react"

interface QATemplateData {
    title: string
    subtitle: string
}

interface QATemplateElementProps {
    data: QATemplateData
}

export function QATemplateElement({ data }: QATemplateElementProps) {
    const { title, subtitle } = data

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-white text-center select-none">
            {/* Header Icon */}
            <div className="mb-8 p-6 bg-purple-50 rounded-full">
                <MessageSquare className="w-16 h-16 text-purple-600" />
            </div>

            {/* Title */}
            <h1 className="text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                {title || "Q&A Session"}
            </h1>

            {/* Subtitle / Instructions */}
            <p className="text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                {subtitle || "Ask your questions now! Scan the code or go to the link to participate."}
            </p>

            {/* Placeholder for QR/Link - Visual only for template */}
            <div className="flex flex-col items-center gap-4 p-8 border-4 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <QrCode className="w-32 h-32 text-slate-300" />
                <span className="font-mono text-slate-400 font-bold">JOIN CODE: 123 456</span>
            </div>

            <div className="mt-auto pt-8 flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest">
                <span>Powered by PollMaker</span>
            </div>
        </div>
    )
}
