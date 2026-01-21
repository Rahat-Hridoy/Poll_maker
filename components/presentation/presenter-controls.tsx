"use client"

import { useState, useEffect } from "react"
import { Slide, Presentation } from "@/lib/data"
import { Play, Pause, Square, BarChart3, MessageSquare, Eye, EyeOff, Lock, Unlock, Users, Timer, QrCode, Settings, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PresenterControlsProps {
    presentation: Presentation
    currentSlide: Slide
    onUpdateSlideState: (slideId: string, updates: Partial<Slide>) => void
    onUpdatePresentationState: (presentationId: string, updates: Partial<Presentation>) => void
    onResetSlideResults: (slideId: string) => Promise<void>
    activeAudienceCount?: number
}

export function PresenterControls({ 
    presentation, 
    currentSlide, 
    onUpdateSlideState, 
    onUpdatePresentationState,
    onResetSlideResults,
    activeAudienceCount = 0
}: PresenterControlsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [timerValue, setTimerValue] = useState("05:00") // Default 5 mins input
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    // Local timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (currentSlide.timer?.isRunning && currentSlide.timer.endsAt) {
            const endsAt = new Date(currentSlide.timer.endsAt).getTime()
            
            interval = setInterval(() => {
                const now = Date.now()
                const diff = Math.ceil((endsAt - now) / 1000)
                
                if (diff <= 0) {
                    setTimeLeft(0)
                } else {
                    setTimeLeft(diff)
                }
            }, 1000)
            
            // Initial set
            const now = Date.now()
            const diff = Math.ceil((endsAt - now) / 1000)
            setTimeLeft(Math.max(0, diff))

        } else {
            setTimeLeft(null)
        }

        return () => clearInterval(interval)
    }, [currentSlide.timer])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const startTimer = () => {
        const [m, s] = timerValue.split(':').map(Number)
        const totalSeconds = (m || 0) * 60 + (s || 0)
        if (totalSeconds <= 0) return

        const endsAt = new Date(Date.now() + totalSeconds * 1000).toISOString()
        
        onUpdateSlideState(currentSlide.id, {
            timer: {
                duration: totalSeconds,
                endsAt,
                isRunning: true
            }
        })
    }

    const pauseTimer = () => {
        if (!currentSlide.timer) return
        onUpdateSlideState(currentSlide.id, {
            timer: {
                ...currentSlide.timer,
                isRunning: false
            }
        })
    }
    
    const resetTimer = () => {
         onUpdateSlideState(currentSlide.id, {
            timer: undefined
        })
        setTimeLeft(null)
    }

    return (
        <div className="fixed top-6 left-6 z-50 flex flex-col items-start gap-3">
            {/* Main Toggle Button */}
            <Button 
                size="icon" 
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border-2",
                    isOpen ? "bg-white text-slate-900 border-white hover:bg-slate-100" : "bg-slate-900/90 backdrop-blur-md text-white border-white/10 hover:bg-slate-800"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
            </Button>

            {/* Menu Container */}
            <div className={cn(
                "flex flex-col gap-3 transition-all duration-300 origin-top-left",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 -translate-y-4 pointer-events-none absolute top-20"
            )}>
                {/* Vertical Menu Items */}
                <div className="p-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-2 custom-scrollbar max-h-[calc(100vh-140px)] overflow-y-auto w-64">
                    
                    {/* Active Audience Badge */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg border border-white/5 mb-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Audience</span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold">
                            {activeAudienceCount}
                        </span>
                    </div>

                    <div className="h-px bg-white/10 my-1" />

                    {/* Lock Toggle */}
                    <Button 
                        variant="ghost" 
                        onClick={() => onUpdateSlideState(currentSlide.id, { isLocked: !currentSlide.isLocked })}
                        className={cn(
                            "justify-start h-10 px-3 transition-all",
                            currentSlide.isLocked 
                                ? "bg-red-500/10 text-red-200 hover:bg-red-500/20" 
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        {currentSlide.isLocked ? <Lock className="w-4 h-4 mr-3 text-red-400" /> : <Unlock className="w-4 h-4 mr-3 opacity-70" />}
                        <span className="text-sm font-medium">{currentSlide.isLocked ? "Unlock Responses" : "Lock Responses"}</span>
                    </Button>

                    {/* Results Toggle */}
                    <Button 
                        variant="ghost" 
                        onClick={() => onUpdateSlideState(currentSlide.id, { showResults: !currentSlide.showResults })}
                        className={cn(
                            "justify-start h-10 px-3 transition-all",
                            currentSlide.showResults 
                                ? "bg-blue-500/10 text-blue-200 hover:bg-blue-500/20" 
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        {currentSlide.showResults ? <Eye className="w-4 h-4 mr-3 text-blue-400" /> : <EyeOff className="w-4 h-4 mr-3 opacity-70" />}
                        <span className="text-sm font-medium">{currentSlide.showResults ? "Hide Results" : "Show Results"}</span>
                    </Button>

                    {/* Comments Toggle */}
                    <Button 
                        variant="ghost" 
                        onClick={() => onUpdateSlideState(currentSlide.id, { allowComments: !currentSlide.allowComments })}
                        className={cn(
                            "justify-start h-10 px-3 transition-all",
                            currentSlide.allowComments 
                                ? "bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20" 
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <MessageSquare className={cn("w-4 h-4 mr-3", currentSlide.allowComments ? "text-emerald-400" : "opacity-70")} />
                        <span className="text-sm font-medium">{currentSlide.allowComments ? "Disable Comments" : "Enable Comments"}</span>
                    </Button>

                    {/* Reset Results Button */}
                     <Button 
                        variant="ghost" 
                        onClick={() => {
                            if (confirm("Are you sure you want to reset all results/votes for this slide? This cannot be undone.")) {
                                onResetSlideResults(currentSlide.id);
                            }
                        }}
                        className="justify-start h-10 px-3 transition-all text-slate-300 hover:text-red-200 hover:bg-red-500/10"
                    >
                        <RotateCcw className="w-4 h-4 mr-3 opacity-70 group-hover:text-red-400" />
                        <span className="text-sm font-medium">Reset Results</span>
                    </Button>

                    <div className="h-px bg-white/10 my-1" />

                    {/* Timer Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "justify-start h-10 px-3 transition-all",
                                    currentSlide.timer?.isRunning 
                                        ? "bg-amber-500/10 text-amber-200 hover:bg-amber-500/20" 
                                        : "text-slate-300 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <Timer className={cn("w-4 h-4 mr-3", currentSlide.timer?.isRunning ? "text-amber-400" : "opacity-70")} />
                                <span className="text-sm font-medium">
                                    {currentSlide.timer?.isRunning && timeLeft !== null
                                        ? `Timer: ${formatTime(timeLeft)}` 
                                        : "Timer"}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="w-64 p-4 bg-slate-900 border-slate-700 text-white shadow-xl">
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-200 flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-amber-400" />
                                    Countdown Timer
                                </h4>
                                <div className="text-center bg-black/30 rounded-lg p-3">
                                    <div className="text-3xl font-mono font-bold tracking-wider tabular-nums text-amber-400">
                                        {timeLeft !== null ? formatTime(timeLeft) : timerValue}
                                    </div>
                                </div>
                                {!currentSlide.timer?.isRunning ? (
                                    <div className="flex gap-2">
                                        <Input 
                                            className="bg-slate-800 border-slate-700 text-center font-mono focus:border-amber-500 h-9"
                                            value={timerValue}
                                            onChange={(e) => setTimerValue(e.target.value)}
                                            placeholder="MM:SS"
                                            maxLength={5}
                                        />
                                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={startTimer}>
                                            Start
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300" onClick={pauseTimer}>
                                            <Pause className="w-4 h-4 mr-2" /> Pause
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={resetTimer}>
                                            <Square className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Join Code Toggle */}
                    <div className="flex items-center justify-between px-3 h-10 rounded-md hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 text-slate-300">
                            <QrCode className="w-4 h-4 opacity-70" />
                            <span className="text-sm font-medium">Join Code</span>
                        </div>
                        <Switch 
                            checked={presentation.showJoiningCode} 
                            onCheckedChange={(checked) => onUpdatePresentationState(presentation.id, { showJoiningCode: checked })}
                            className="scale-75"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
