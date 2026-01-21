'use client'

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { fetchPresentation } from "@/app/actions/presentation"
import { submitVoteAction } from "@/app/actions/audience"
import { submitQuestion } from "@/app/actions/qa"
import { Presentation, QAQuestion } from "@/lib/data"
import { Loader2, Vote, BarChart3, CheckCircle2, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SlideRenderer } from "@/components/slide-editor/slide-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function LiveAudiencePage() {
    const params = useParams()
    const [presentation, setPresentation] = useState<Presentation | null>(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pollData, setPollData] = useState<any>(null)
    const [isQA, setIsQA] = useState(false)
    const [qaData, setQaData] = useState<{ title: string, subtitle: string } | null>(null)
    const [questions, setQuestions] = useState<QAQuestion[]>([])
    
    const [scale, setScale] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Poll State
    const [isVoteOpen, setIsVoteOpen] = useState(false)
    
    // Q&A State
    const [isQAOpen, setIsQAOpen] = useState(false)
    const [questionText, setQuestionText] = useState("")
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

    const presentationId = params.id as string

    // Polling for updates
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchPresentation(presentationId)
            if (data) {
                setPresentation(data)
                
                // Get current slide
                const currentSlide = data.slides[data.currentSlideIndex || 0]
                if (currentSlide) {
                    try {
                        const parsed = JSON.parse(currentSlide.content || '[]')
                        const elements = Array.isArray(parsed) ? parsed : [parsed]
                        
                        // Check for Poll
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const pollEl = elements.find((el: any) => el?.type === 'poll-template')
                        if (pollEl) {
                            const parsedPollData = JSON.parse(pollEl.content)
                            setPollData((prev: any) => {
                                if (prev?.question !== parsedPollData.question) {
                                    setHasVoted(false)
                                    return parsedPollData
                                }
                                return prev
                            })
                            setIsQA(false)
                            setQaData(null)
                        } else {
                            setPollData(null)
                            setIsVoteOpen(false)
                            
                            // Check for Q&A
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const qaEl = elements.find((el: any) => el?.type === 'qa-template')
                            if (qaEl) {
                                setIsQA(true)
                                setQaData(JSON.parse(qaEl.content))
                                // Extract questions for this slide
                                if (data.qaSessions && data.qaSessions[currentSlide.id]) {
                                    setQuestions(data.qaSessions[currentSlide.id])
                                } else {
                                    setQuestions([])
                                }
                                // Reset vote/success state for new Q&A session if needed
                                // We reuse hasVoted for Q&A success message
                                if (qaData?.title !== JSON.parse(qaEl.content).title) {
                                     setHasVoted(false)
                                }
                            } else {
                                setIsQA(false)
                                setQaData(null)
                                setIsQAOpen(false)
                            }
                        }
                    } catch {
                        setPollData(null)
                        setIsQA(false)
                    }
                }
            }
            setLoading(false)
        }

        loadData() // Initial load
        const intervalId = setInterval(loadData, 1000)

        return () => clearInterval(intervalId)
    }, [presentationId])

    // Base dimensions
    const baseWidth = 1000
    const [w, h] = (presentation?.aspectRatio || '16:9').split(':').map(Number)
    const baseHeight = (baseWidth * h) / w

    // Calculate scaling to fit window
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const parent = containerRef.current

            const parentWidth = parent.clientWidth
            const parentHeight = parent.clientHeight

            const scaleX = parentWidth / baseWidth
            const scaleY = parentHeight / baseHeight

            const calculatedScale = Math.min(scaleX, scaleY) * 0.95
            setScale(calculatedScale)
        }

        window.addEventListener('resize', handleResize)
        if (presentation) handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [presentation, baseHeight])

    const handleVote = async (optionId: string) => {
        if (!presentation || !presentation.slides[presentation.currentSlideIndex || 0]) return

        setVoting(true)
        const slideId = presentation.slides[presentation.currentSlideIndex || 0].id

        try {
            const result = await submitVoteAction(presentationId, slideId, optionId)
            if (result.success) {
                setHasVoted(true)
                setTimeout(() => {
                    setIsVoteOpen(false) // Close modal after delay
                }, 2000)
            }
        } catch (e) {
            console.error("Vote failed", e)
        } finally {
            setVoting(false)
        }
    }
    
    const handleSubmitQuestion = async () => {
        if (!questionText.trim() || !presentation) return
        
        setIsSubmittingQuestion(true)
        const slideId = presentation.slides[presentation.currentSlideIndex || 0].id
        
        try {
            const result = await submitQuestion(presentationId, slideId, questionText)
            if (result.success) {
                setQuestionText("")
                setHasVoted(true)
            } else {
               console.error("Failed to submit question", result.error)
            }
        } catch (e) {
            console.error("Error submitting question", e)
        } finally {
            setIsSubmittingQuestion(false)
        }
    }

    if (loading && !presentation) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>
    }

    if (!presentation) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Presentation not found</div>
    }

    return (
        <div className="h-screen w-screen bg-black flex flex-col relative overflow-hidden">
            {/* Simplified Q&A View */}
            {isQA ? (
                 <div className="absolute inset-0 z-50 bg-white flex items-center justify-center p-6">
                     <div className="w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-500">
                         {hasVoted ? (
                             <div className="text-center">
                                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                     <CheckCircle2 className="w-10 h-10" />
                                 </div>
                                 <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Question Sent!</h3>
                                 <p className="text-xl text-slate-500 mb-10 leading-relaxed">The presenter will see your question shortly.</p>
                                 <Button 
                                     size="lg"
                                     onClick={() => setHasVoted(false)}
                                     className="w-full h-14 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02]"
                                 >
                                     Ask Another Question
                                 </Button>
                             </div>
                         ) : (
                             <div className="flex flex-col h-full">
                                <div className="text-center mb-10">
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Q&A Session</h3>
                                    <p className="text-slate-500 text-lg">Ask your question anonymously</p>
                                </div>
                                <div className="space-y-6">
                                    <textarea 
                                        placeholder="Type your question here..." 
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        className="w-full h-48 p-6 text-xl bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-black focus:ring-0 transition-all resize-none placeholder:text-slate-300 text-slate-900 shadow-inner"
                                    />
                                    <Button 
                                        size="lg"
                                        onClick={handleSubmitQuestion}
                                        disabled={!questionText.trim() || isSubmittingQuestion}
                                        className="w-full h-16 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 text-xl transition-all hover:scale-[1.02]"
                                    >
                                        {isSubmittingQuestion ? (
                                            <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                        ) : null}
                                        {isSubmittingQuestion ? "Sending..." : "Submit Question"}
                                    </Button>
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Live Presentation View */}
                    <div ref={containerRef} className="flex-1 w-full flex items-center justify-center">
                        <SlideRenderer
                            slide={presentation.slides[presentation.currentSlideIndex || 0]}
                            scale={scale}
                            interactive={false} // Audience just watches, votes via button
                            height={baseHeight}
                            runtimeData={{ questions: isQA ? questions : undefined }}
                        />
                    </div>
        
                    {/* Header / Status Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/60 to-transparent flex justify-between items-start pointer-events-none">
                        <div className="pointer-events-auto">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-white font-bold text-sm tracking-widest">LIVE</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Voting FAB */}
            {!isQA && pollData && (
                <div className="absolute top-4 right-4 z-50">
                    <Dialog open={isVoteOpen} onOpenChange={setIsVoteOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="rounded-full h-14 px-6 shadow-xl bg-blue-600 hover:bg-blue-500 text-white font-bold animate-bounce"
                            >
                                <Vote className="mr-2 h-5 w-5" />
                                Vote Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white text-slate-900 border-none">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Cast Your Vote
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-4">
                                <h3 className="text-lg font-medium mb-4">{pollData.question}</h3>
                                <div className="space-y-3">
                                    {hasVoted ? (
                                        <div className="text-center py-8 bg-green-50 rounded-xl">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                            <p className="font-bold text-slate-800">Vote Submitted!</p>
                                        </div>
                                    ) : (
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        pollData.options.map((opt: any) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleVote(opt.id)}
                                                disabled={voting}
                                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium flex justify-between items-center group"
                                            >
                                                {opt.text}
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-500" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            

        </div>
    )
}
