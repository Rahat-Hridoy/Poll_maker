"use client"

import { Slide } from "@/lib/data"
import { SlideTextEditor } from "@/components/slide-editor/slide-text-editor"
import { SlidePollElement } from "@/components/slide-editor/slide-poll-element"
import { PollTemplateElement } from "@/components/slide-editor/poll-template-element"
import { QuizTemplateElement } from "@/components/slide-editor/quiz-template-element"
import { QATemplateElement } from "@/components/slide-editor/qa-template-element"

interface SlideRendererProps {
    slide: Slide
    width?: number
    height?: number
    scale?: number
    interactive?: boolean
    onPollVote?: (optionId: string) => void
    hasVoted?: boolean
}

// Coordinate system is based on 1000px width
const BASE_WIDTH = 1000

export function SlideRenderer({ slide, width = 1000, height, scale: externalScale, interactive = false, onPollVote, hasVoted }: SlideRendererProps) {
    // 16:9 Aspect Ratio default if height not provided
    const baseHeight = height || (BASE_WIDTH * 9) / 16

    // If external scale provided, use it. Otherwise calculate based on target width vs base
    const effectiveScale = externalScale || (width / BASE_WIDTH)

    const elements = (() => {
        try {
            return slide.content && slide.content.startsWith('[')
                ? JSON.parse(slide.content)
                : []
        } catch {
            return []
        }
    })()

    return (
        <div
            style={{
                width: BASE_WIDTH * effectiveScale,
                height: baseHeight * effectiveScale,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    width: BASE_WIDTH,
                    height: baseHeight,
                    transform: `scale(${effectiveScale})`,
                    transformOrigin: 'top left',
                    backgroundColor: slide.background?.startsWith('#') ? slide.background : 'white',
                    backgroundImage: slide.background?.startsWith('http') ? `url(${slide.background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    overflow: 'hidden',
                    // Pointer events none prevents interaction with mini elements in preview, but allows it when interactive is true
                    pointerEvents: interactive ? 'auto' : 'none'
                }}
            >
                {elements.map((el: any) => (
                    <div
                        key={el.id}
                        style={{
                            position: 'absolute',
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            zIndex: el.type === 'image' ? 0 : 1
                        }}
                    >
                        {/* Text Element */}
                        {el.type === 'text' && (
                            <SlideTextEditor
                                content={el.content || ''}
                                onChange={() => { }}
                                editable={false}
                                zoom={effectiveScale}
                                className="w-full h-full"
                                style={{
                                    fontSize: el.style.fontSize,
                                    color: el.style.color,
                                    textAlign: el.style?.textAlign,
                                    fontFamily: el.style.fontFamily,
                                }}
                            />
                        )}

                        {/* Image Element */}
                        {el.type === 'image' && (
                            <img
                                src={el.content || '/placeholder.png'}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        )}

                        {/* Poll Element */}
                        {el.type === 'poll' && (
                            <SlidePollElement
                                pollId={(() => { try { return JSON.parse(el.content || '{}').pollId || '' } catch { return '' } })()}
                                title={(() => { try { return JSON.parse(el.content || '{}').title || '' } catch { return '' } })()}
                            />
                        )}

                        {/* QR Code Element */}
                        {el.type === 'qr-code' && (
                            <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 gap-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scan to Vote</div>
                                <img
                                    src={(() => { try { return JSON.parse(el.content || '{}').qrUrl } catch { return '' } })()}
                                    className="w-[85%] h-auto aspect-square object-contain"
                                    alt="QR Code"
                                />
                            </div>
                        )}

                        {el.type === 'poll-template' && (
                            <PollTemplateElement
                                data={(() => {
                                    try {
                                        return JSON.parse(el.content || '{}')
                                    } catch {
                                        return { question: '', options: [] }
                                    }
                                })()}
                                onVote={onPollVote}
                                hasVoted={hasVoted}
                            />
                        )}

                        {/* Quiz Template Element */}
                        {el.type === 'quiz-template' && (
                            <QuizTemplateElement
                                data={(() => {
                                    try {
                                        return JSON.parse(el.content || '{}')
                                    } catch {
                                        return { question: '', options: [] }
                                    }
                                })()}
                            />
                        )}

                        {/* Q&A Template Element */}
                        {el.type === 'qa-template' && (
                            <QATemplateElement
                                data={(() => {
                                    try {
                                        return JSON.parse(el.content || '{}')
                                    } catch {
                                        return { title: '', subtitle: '' }
                                    }
                                })()}
                            />
                        )}

                        {/* Shapes (SVG Rendering) */}
                        {['rect', 'circle', 'triangle', 'arrow', 'star', 'polygon', 'line', 'arrow-line', 'sine-wave', 'square-wave', 'tan-wave'].includes(el.type) && (
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                                <g
                                    fill={el.style.backgroundColor || 'none'}
                                    stroke={el.style.borderColor || el.style.stroke || 'none'}
                                    strokeWidth={
                                        el.style.strokeWidth !== undefined ? el.style.strokeWidth :
                                            el.style.borderWidth !== undefined ? parseInt(el.style.borderWidth) :
                                                0
                                    }
                                    strokeDasharray={
                                        el.style.borderStyle === 'dashed' ? '10,10' :
                                            el.style.borderStyle === 'dotted' ? '2,4' :
                                                'none'
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {el.type === 'rect' && <rect x="5" y="5" width="90" height="90" rx={el.style.borderRadius === '50%' ? '45' : '0'} />}
                                    {el.type === 'circle' && <circle cx="50" cy="50" r="45" />}
                                    {el.type === 'triangle' && <polygon points="50,5 95,95 5,95" />}
                                    {el.type === 'star' && <polygon points="50,5 61,39 95,39 67,61 78,95 50,73 22,95 33,61 5,39 39,39" />}
                                    {el.type === 'polygon' && <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" />}
                                    {el.type === 'arrow' && <polygon points="5,40 60,40 60,10 95,50 60,90 60,60 5,60" />}
                                    {el.type === 'line' && <line x1="0" y1="50" x2="100" y2="50" />}
                                    {el.type === 'arrow-line' && (
                                        <g>
                                            <line x1="0" y1="50" x2="100" y2="50" />
                                            <polygon points="90,40 100,50 90,60" fill="currentColor" stroke="none" />
                                        </g>
                                    )}
                                    {el.type === 'sine-wave' && (
                                        <path d="M 0 50 C 12.5 0, 12.5 0, 25 50 C 37.5 100, 37.5 100, 50 50 C 62.5 0, 62.5 0, 75 50 C 87.5 100, 87.5 100, 100 50" fill="none" />
                                    )}
                                    {el.type === 'square-wave' && (
                                        <path d="M 0 50 L 0 10 L 25 10 L 25 90 L 50 90 L 50 10 L 75 10 L 75 90 L 100 90 L 100 50" fill="none" />
                                    )}
                                    {el.type === 'tan-wave' && (
                                        <path d="M 0 100 Q 20 0, 40 100 T 80 100 T 120 100" fill="none" />
                                    )}
                                </g>
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
