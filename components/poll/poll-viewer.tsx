"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PollResults } from "@/components/poll/poll-results"
import { submitVote, trackPollVisitor } from "@/app/actions"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2, BarChart3, Hash, ArrowRight } from "lucide-react"
import Link from "next/link"

export function PollViewer({ poll }: { poll: any }) {
    const [hasVoted, setHasVoted] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({})
    const [voterName, setVoterName] = useState("")
    const [voterEmail, setVoterEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (poll?.id) {
            trackPollVisitor(poll.id);
        }
    }, [poll?.id]);

    const handleOptionChange = (questionId: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [questionId]: value }))
    }
    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const result = await submitVote(poll.id, selectedOptions as Record<string, string>, { name: voterName, email: voterEmail })
            if (result.success) {
                setHasVoted(true)
            } else {
                alert("Failed to submit vote: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred while voting.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const style = poll.style || {}
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    const defaultTextColor = isDark ? '#ffffff' : '#0f172a'

    const safeTitleStyle = style.title || { fontSize: 32, fontWeight: 'bold' as const, color: style.textColor || defaultTextColor }
    const safeQuestionStyle = style.question || { fontSize: 18, fontWeight: 'medium' as const, color: style.textColor || defaultTextColor }
    const safeOptionStyle = style.option || {
        fontSize: 16,
        fontWeight: 'normal' as const,
        color: style.textColor || defaultTextColor,
        container: { borderShape: 'rounded' as const, padding: 16, backgroundColor: 'transparent', borderColor: 'rgba(128,128,128,0.2)' }
    }

    if (hasVoted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <PollResults pollId={poll.id} initialPoll={poll} />
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-primary/20" style={{ fontFamily: style.fontFamily }}>
            <div className="max-w-3xl mx-auto space-y-12">

                {/* Elegant Voter Header */}
                <header className="flex items-center justify-between pb-8 border-b border-border/40 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            <span className="flex h-1 w-1 rounded-full bg-primary animate-pulse"></span>
                            Active Session
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-0.5">PollMaker Professional</h2>
                    </div>
                    <Link href="/poll">
                        <Button variant="ghost" size="sm" className="rounded-full font-bold text-xs hover:bg-primary/5 transition-all">
                            <Hash className="mr-2 h-3.5 w-3.5" /> Join Another
                        </Button>
                    </Link>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-16"
                >
                    {/* Poll Title Section */}
                    <div className="text-center space-y-6">
                        <h1
                            className="text-4xl md:text-5xl font-black tracking-tight leading-tight transition-colors duration-500"
                            style={{
                                fontFamily: safeTitleStyle.fontFamily || style.fontFamily,
                                color: safeTitleStyle.color === '#000000' ? 'inherit' : safeTitleStyle.color,
                                fontSize: `${Math.max(40, safeTitleStyle.fontSize)}px`
                            }}
                        >
                            {poll.title}
                        </h1>
                    </div>

                    <div className="space-y-12">
                        {/* Voter Identity Card - Ultra Modern */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className="shadow-2xl shadow-primary/5 border border-border/50 bg-card/60 backdrop-blur-2xl relative overflow-hidden group transition-all duration-500 hover:shadow-primary/10" style={{
                                borderRadius: style.boxShape === 'rounded' ? '2.5rem' : style.boxShape === 'pill' ? '3.5rem' : '0',
                            }}>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-border/20">
                                    <div className="h-full bg-primary w-0 group-focus-within:w-full transition-all duration-1000 ease-in-out" />
                                </div>
                                <CardHeader className="pt-12 pb-8 px-10">
                                    <CardTitle className="text-3xl font-black text-foreground tracking-tight">Identify Yourself</CardTitle>
                                    <CardDescription className="text-muted-foreground text-base font-medium">To ensure unique results, please provide your details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pb-12 px-10">
                                    <div className="grid gap-4">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-2">Full Name</Label>
                                        <div className="relative group/input">
                                            <Input
                                                id="name"
                                                placeholder="e.g. Alexander Pierce"
                                                value={voterName}
                                                onChange={(e) => setVoterName(e.target.value)}
                                                className="h-16 bg-background/30 border-2 border-border/50 focus:border-primary focus:ring-primary px-8 text-xl font-bold transition-all placeholder:text-muted-foreground/30 shadow-sm"
                                                style={{ borderRadius: style.boxShape === 'pill' ? '9999px' : '1.5rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4">
                                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-2">Email Address</Label>
                                        <div className="relative group/input">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="e.g. alex@example.com"
                                                value={voterEmail}
                                                onChange={(e) => setVoterEmail(e.target.value)}
                                                className="h-16 bg-background/30 border-2 border-border/50 focus:border-primary focus:ring-primary px-8 text-xl font-bold transition-all placeholder:text-muted-foreground/30 shadow-sm"
                                                style={{ borderRadius: style.boxShape === 'pill' ? '9999px' : '1.5rem' }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="space-y-12">
                            {poll.questions.map((question: any, index: number) => (
                                <motion.div key={question.id} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
                                    <div className="relative group/question">
                                        <div className="absolute -left-12 top-2 hidden lg:flex flex-col items-center opacity-20 group-hover/question:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black uppercase vertical-rl tracking-[0.3em] mb-4">Question</span>
                                            <div className="w-0.5 h-20 bg-primary/20" />
                                        </div>

                                        <Card
                                            className="shadow-2xl shadow-black/5 hover:shadow-primary/5 transition-all duration-700 border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden"
                                            style={{
                                                backgroundColor: style.backgroundColor && style.backgroundColor !== '#ffffff' ? `${style.backgroundColor}90` : undefined,
                                                borderRadius: style.boxShape === 'rounded' ? '2.5rem' : style.boxShape === 'pill' ? '3.5rem' : '0',
                                            }}
                                        >
                                            <CardHeader className="pt-12 pb-6 px-10">
                                                <CardTitle
                                                    className="leading-[1.2] tracking-tight"
                                                    style={{
                                                        fontFamily: safeQuestionStyle.fontFamily || style.fontFamily,
                                                        fontSize: `${Math.max(safeQuestionStyle.fontSize, 28)}px`,
                                                        fontWeight: 800,
                                                        color: safeQuestionStyle.color === '#000000' ? 'inherit' : safeQuestionStyle.color
                                                    }}
                                                >
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground text-base font-black mr-4 align-middle shadow-lg shadow-primary/20">
                                                        {index + 1}
                                                    </span>
                                                    {question.text}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pb-12 px-10">
                                                <RadioGroup
                                                    value={selectedOptions[question.id] as string}
                                                    onValueChange={(val) => handleOptionChange(question.id, val)}
                                                    className="grid gap-5"
                                                >
                                                    {question.options.map((option: any) => (
                                                        <div
                                                            key={option.id}
                                                            className={cn(
                                                                "flex items-center space-x-6 border-2 transition-all duration-500 cursor-pointer relative group/option",
                                                                selectedOptions[question.id] === option.id
                                                                    ? "shadow-2xl shadow-primary/10 border-primary scale-[1.02] bg-primary/3"
                                                                    : "border-border/50 hover:border-primary/40 hover:bg-primary/2"
                                                            )}
                                                            style={{
                                                                padding: `${safeOptionStyle.container?.padding || 20}px`,
                                                                borderRadius: safeOptionStyle.container?.borderShape === 'pill' ? '9999px' : safeOptionStyle.container?.borderShape === 'rounded' ? '1rem' : '0',
                                                                backgroundColor: selectedOptions[question.id] === option.id ? `${style.primaryColor}15` : 'transparent',
                                                            }}
                                                            onClick={() => handleOptionChange(question.id, option.id)}
                                                        >
                                                            <div className="relative flex items-center justify-center">
                                                                <RadioGroupItem
                                                                    value={option.id}
                                                                    id={option.id}
                                                                    className="h-8 w-8 border-2 transition-all group-hover/option:scale-110 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    style={{
                                                                        borderColor: selectedOptions[question.id] === option.id ? style.primaryColor : 'var(--border)',
                                                                        color: '#fff'
                                                                    }}
                                                                />
                                                            </div>
                                                            <Label
                                                                htmlFor={option.id}
                                                                className="flex-1 cursor-pointer font-black text-xl tracking-tight select-none transition-colors group-hover/option:text-foreground"
                                                                style={{
                                                                    fontFamily: safeOptionStyle.fontFamily || style.fontFamily,
                                                                    fontSize: `${Math.max(safeOptionStyle.fontSize, 18)}px`,
                                                                    fontWeight: 700,
                                                                    color: selectedOptions[question.id] === option.id ? style.primaryColor : (safeOptionStyle.color === '#000000' ? 'inherit' : safeOptionStyle.color)
                                                                }}
                                                            >
                                                                {option.text}
                                                            </Label>
                                                            <AnimatePresence>
                                                                {selectedOptions[question.id] === option.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                                        className="absolute right-8 h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50"
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Section - Grandiose */}
                    <motion.div
                        className="pt-12 text-center space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            className="w-full max-w-sm h-14 text-lg font-bold tracking-tight shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden disabled:opacity-50"
                            style={{
                                backgroundColor: style.primaryColor,
                                borderRadius: style.boxShape === 'pill' ? '9999px' : '0.75rem',
                                boxShadow: `0 10px 25px -5px ${style.primaryColor}40`
                            }}
                            disabled={
                                Object.keys(selectedOptions).length !== poll.questions.length ||
                                !voterName.trim() ||
                                !voterEmail.trim() ||
                                isSubmitting
                            }
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Cast My Vote</span>
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                        <div className="flex flex-col items-center gap-4 opacity-40">
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">
                                Secure Engagement • Real-time Insights • Professional Grade
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="h-px w-8 bg-border" />
                                <BarChart3 className="h-4 w-4" />
                                <div className="h-px w-8 bg-border" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
