"use client"

import { MessageSquare, Users, QrCode } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'

interface QATemplateData {
    title: string
    subtitle: string
    questionImage?: string
    layout?: 'vertical' | 'horizontal-left' | 'horizontal-right' | 'split-left'
    showCode?: boolean
    showQR?: boolean
}

interface QATemplateElementProps {
    data: QATemplateData
    shortCode?: string
}

export function QATemplateElement({ data, shortCode = "12345" }: QATemplateElementProps) {
    const { title, subtitle, questionImage } = data
    const layout = data.layout || 'vertical'
    const showCode = data.showCode
    const showQR = data.showQR

    const displayTitle = title || "Q&A Session"
    const displaySubtitle = subtitle || "Ask your questions now! Scan the code or use the link."

    const HeaderSection = () => (
        <div className="flex flex-col w-full gap-4 mb-2">
            {showCode && (
                <div className={`mx-auto bg-white border-2 border-slate-200 rounded-lg px-8 py-1 shadow-sm animate-in slide-in-from-top-4 fade-in duration-500`}>
                    <div className="text-center flex items-center justify-center gap-3 ">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Join with Code:  </span>
                        <div className="text-xl font-black text-slate-800 tracking-widest mt-0.5 font-mono">{shortCode}</div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Live Q&A</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Audience Listening</span>
                </div>
            </div>
        </div>
    )

    const ImageSection = ({ className = "" }: { className?: string }) => (
        questionImage ? (
            <div className={`flex justify-center shrink-0 ${className}`}>
                <img
                    src={questionImage}
                    alt="Q&A Topic"
                    className="h-full w-full object-contain rounded-lg shadow-sm border border-slate-100 max-h-full"
                />
            </div>
        ) : null
    )

    const CONTENT_AREA_CLASS = "flex-1 w-full relative p-4 min-h-0 overflow-y-auto"

    const QrOrInstructions = () => (
        <div className={CONTENT_AREA_CLASS}>
            <div className="flex h-full gap-6 items-center justify-center">
                {/* QR Code Section */}
                {showQR && (
                    <div className="flex flex-col justify-center shrink-0 animate-in slide-in-from-left-4 fade-in duration-700 delay-150">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                            <QRCodeSVG
                                value={`https://poll.com/join/${shortCode}`}
                                size={180}
                                level="H"
                                className="w-full h-full"
                            />
                            <div className="text-center mt-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scan to Ask</span>
                            </div>
                        </div>
                    </div>
                )}

                {!showQR && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border-4 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 w-full max-w-lg">
                        <div className="mb-4 p-4 bg-white rounded-full shadow-sm">
                            <MessageSquare className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Waiting for questions...</h3>
                        <p className="text-slate-400 text-sm">Audience questions will appear here dynamically during the presentation.</p>
                    </div>
                )}
            </div>
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
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-purple-50/30">
                            <MessageSquare className="w-24 h-24 opacity-20 text-purple-400" />
                        </div>
                    )}
                </div>
                {/* Right Side: Content */}
                <div className="w-1/2 flex flex-col h-full">
                    <HeaderSection />
                    <div className="flex-1 flex flex-col justify-center text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            {displayTitle}
                        </h1>
                        <p className="text-xl text-slate-500 mb-8 leading-relaxed">
                            {displaySubtitle}
                        </p>
                        <div className="flex-1 min-h-0 w-full flex flex-col">
                            <QrOrInstructions />
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
                        <div className="w-1/3 h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-2">
                            <span className="text-slate-400 text-sm font-medium">No Image</span>
                        </div>
                    )}

                    {/* Question Side */}
                    <div className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-xl border border-slate-100/50 text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                            {displayTitle}
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            {displaySubtitle}
                        </p>
                    </div>
                </div>

                {/* Bottom Section: QR / Instructions */}
                <div className="flex-1 w-full min-h-0 relative flex flex-col">
                    <QrOrInstructions />
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
            <div className="mb-4 text-center">
                <h1 className={`${questionImage ? 'text-4xl' : 'text-6xl'} font-extrabold text-slate-900 mb-4 tracking-tight`}>
                    {displayTitle}
                </h1>
                <p className="text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
                    {displaySubtitle}
                </p>
            </div>
            <QrOrInstructions />
        </div>
    )
}
