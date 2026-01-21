"use client"

import { QRCodeSVG } from 'qrcode.react'

interface InstructionTemplateData {
    shortCode?: string
    joinUrl?: string
}

interface InstructionTemplateElementProps {
    data: InstructionTemplateData
    hasVoted?: boolean
}

export function InstructionTemplateElement({ data }: InstructionTemplateElementProps) {
    // Default values
    const shortCode = data.shortCode || "1234 5678"
    const joinUrl = data.joinUrl || "slidestudio.com"
    const fullJoinUrl = `https://${joinUrl}/`

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none relative font-sans">
            {/* Background enhancement */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="w-full h-full p-8 flex flex-col items-center z-10">
                {/* Top Floating Pill */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-full py-2.5 px-8 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-300 shrink-0 mb-8">
                    <span className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Join at</span>
                    <span className="text-blue-600 text-base font-bold">{joinUrl}</span>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <span className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Code</span>
                    <span className="text-slate-900 text-lg font-black tracking-widest bg-slate-100 rounded px-2 py-0.5">{shortCode}</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 -mt-8">
                    {/* Main Title */}
                    <h1 className="text-6xl font-extrabold text-slate-900 mb-10 tracking-tight drop-shadow-sm">
                        Instructions
                    </h1>

                    <div className="flex w-full max-w-4xl items-center justify-center gap-12">
                        
                        {/* LEFT: Steps */}
                        <div className="flex flex-col items-end text-right space-y-8 flex-1">
                            {/* Step 1 */}
                            <div className="group flex flex-col items-end transition-all duration-300 hover:translate-x-1">
                                <p className="text-lg text-slate-400 font-bold uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Step 1</p>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl text-slate-600 font-medium">Go to</span>
                                    <span className="text-5xl font-bold text-blue-600 tracking-tight mt-1">{joinUrl}</span>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="group flex flex-col items-end transition-all duration-300 hover:translate-x-1">
                                <p className="text-lg text-slate-400 font-bold uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Step 2</p>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl text-slate-600 font-medium">Enter code</span>
                                    <span className="text-6xl font-black text-slate-900 tracking-widest leading-none mt-2 font-mono">{shortCode}</span>
                                </div>
                            </div>
                        </div>

                        {/* CENTER: Divider */}
                        <div className="h-64 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

                        {/* RIGHT: QR Code */}
                        <div className="flex flex-col items-start flex-1 pl-4">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative transition-transform duration-300 group-hover:scale-[1.02]">
                                    <QRCodeSVG
                                        value={fullJoinUrl}
                                        size={220}
                                        level="H"
                                        className="w-full h-full"
                                        imageSettings={{
                                            src: "/logo.png",
                                            x: undefined,
                                            y: undefined,
                                            height: 28,
                                            width: 28,
                                            excavate: true,
                                        }}
                                    />
                                </div>
                                <div className="absolute -bottom-8 left-0 right-0 text-center">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Scan to join</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
