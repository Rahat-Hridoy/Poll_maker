"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Palette, Save, ArrowLeft, Plus, LayoutDashboard, Type, Copy, Trash2, ArrowRight, Sun, Moon, Smartphone, Monitor, Eye, EyeOff, ArrowUpFromLine, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { PollQuestion, PollSettings, PollStyle, POLL_TEMPLATES } from "@/lib/data"
import { createPoll } from "@/app/actions"
import { Accordion, AccordionItem } from "@/components/ui/accordion-simple"
import { FontControls, ColorPicker } from "./style-controls"
import { cn } from "@/lib/utils"
import { Sidebar, QuestionNavItem } from "./editor-components"
import { PollViewer } from "@/components/poll/poll-viewer"

function EditorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateName = searchParams.get('template')

    // Initial State Setup
    const template = POLL_TEMPLATES.find(t => t.name === templateName) || POLL_TEMPLATES[0]

    // Helper to safety check style objects (in case they are undefined on legacy templates)
    const safeStyle = (s: PollStyle) => ({
        ...s,
        title: s.title || { fontFamily: s.fontFamily, fontSize: 32, fontWeight: 'bold' as const, color: s.textColor },
        question: s.question || {
            fontFamily: s.fontFamily, fontSize: 18, fontWeight: 'medium' as const, color: s.textColor,
            input: { borderShape: s.boxShape === 'rounded' ? 'rounded' as const : s.boxShape === 'pill' ? 'pill' as const : 'square' as const, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', shadow: false }
        },
        option: s.option || {
            fontFamily: s.fontFamily, fontSize: 16, fontWeight: 'normal' as const, color: s.textColor,
            radio: { type: 'classic' as const, size: 'md' as const, activeColor: s.primaryColor },
            container: { borderShape: s.boxShape === 'pill' ? 'pill' as const : 'rounded' as const, borderColor: '#e2e8f0', backgroundColor: '#ffffff', hoverEffect: true, padding: 12, gap: 10 }
        }
    })

    const [style, setStyle] = useState<PollStyle>(safeStyle(template.style))
    const [title, setTitle] = useState("")
    const [questions, setQuestions] = useState<PollQuestion[]>([
        { id: 'q1', text: '', type: 'single', options: [{ id: 'o1', text: '', votes: 0 }, { id: 'o2', text: '', votes: 0 }] }
    ])
    const [settings, setSettings] = useState<PollSettings>({
        allowMultipleVotes: false,
        showResults: true,
        allowEditVote: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // UI State
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop')
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [scheduledDate, setScheduledDate] = useState("")

    const pollId = searchParams.get('id')

    // Fetch existing poll if ID is present
    useEffect(() => {
        const fetchPoll = async () => {
            if (!pollId) return

            setIsLoading(true)
            try {
                const response = await fetch(`/api/polls/${pollId}`)
                if (response.ok) {
                    const poll = await response.json()
                    setTitle(poll.title)
                    setQuestions(poll.questions)
                    if (poll.style) setStyle(safeStyle(poll.style))
                    if (poll.settings) setSettings(poll.settings)
                }
            } catch (error) {
                console.error("Failed to fetch poll:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPoll()
    }, [pollId])

    // Handlers
    const addQuestion = () => {
        const newQ = {
            id: `q-${Date.now()}`,
            text: '',
            type: 'single' as const,
            options: [{ id: `o-${Date.now()}-1`, text: '', votes: 0 }, { id: `o-${Date.now()}-2`, text: '', votes: 0 }]
        }
        setQuestions([...questions, newQ])
        setActiveQuestionIdx(questions.length)
    }

    const updateQuestion = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
    }

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? {
            ...q,
            options: [...q.options, { id: `o-${Date.now()}`, text: '', votes: 0 }]
        } : q))
    }

    const updateOption = (qId: string, oId: string, text: string) => {
        setQuestions(questions.map(q => q.id === qId ? {
            ...q,
            options: q.options.map(o => o.id === oId ? { ...o, text } : o)
        } : q))
    }

    const removeOption = (qId: string, oId: string) => {
        setQuestions(questions.map(q => q.id === qId ? {
            ...q,
            options: q.options.filter(o => o.id !== oId)
        } : q))
    }

    const handleSave = async (status: 'draft' | 'published' | 'scheduled', scheduledAt?: string) => {
        if (!title.trim()) {
            alert("Please enter a poll title")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = {
                id: pollId, // Pass ID if it exists to trigger update
                title,
                questions,
                status,
                scheduledAt,
                style,
                settings
            }
            const result = await createPoll(formData)
            if (result.success) {
                router.push('/admin/dashboard')
            } else {
                alert("Failed to save poll")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading poll editor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            {/* Top Bar */}
            <header className="h-16 border-b bg-card/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm border-border/60">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full" onClick={() => router.push('/admin/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <div className="font-bold text-foreground tracking-tight flex items-center gap-2">
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-black">Editor</span>
                        <span className="max-w-[200px] truncate">{title || "Untitled Poll"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Device Toggle (Only in Preview Mode) */}
                    {isPreviewMode && (
                        <div className="flex items-center bg-muted p-1 rounded-full mr-2 border border-border">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={cn(
                                    "p-1.5 rounded-full transition-all",
                                    previewMode === 'desktop' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Desktop View"
                            >
                                <Monitor className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={cn(
                                    "p-1.5 rounded-full transition-all",
                                    previewMode === 'mobile' ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Mobile View"
                            >
                                <Smartphone className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <Button
                        variant={isPreviewMode ? "default" : "outline"}
                        size="sm"
                        className={cn("rounded-full px-4 h-9 font-medium transition-all active:scale-95", isPreviewMode ? "bg-primary text-primary-foreground hover:opacity-90" : "text-muted-foreground border-border hover:bg-muted")}
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                        {isPreviewMode ? <><EyeOff className="mr-2 h-4 w-4" /> Editing Mode</> : <><Eye className="mr-2 h-4 w-4" /> Preview Mode</>}
                    </Button>

                    <div className="h-4 w-px bg-border mx-1" />

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground rounded-full px-4"
                            onClick={() => handleSave('draft')}
                            disabled={isSubmitting}
                        >
                            <Save className="mr-2 h-4 w-4" /> Save as Draft
                        </Button>
                        <Button
                            className="bg-primary hover:opacity-90 text-primary-foreground shadow-md shadow-primary/20 rounded-full px-6 h-9 font-bold transition-all active:scale-95 flex items-center gap-2"
                            onClick={() => setPublishDialogOpen(true)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Publishing..." : <><ArrowRight className="h-4 w-4" /> Publish</>}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Left Sidebar: Question Navigation (Hidden in Preview) */}
                {!isPreviewMode && (
                    <Sidebar
                        side="left"
                        isOpen={leftSidebarOpen}
                        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
                        title="Structure"
                        icon={Type}
                    >
                        <div className="space-y-1">
                            {questions.map((q, idx) => (
                                <QuestionNavItem
                                    key={q.id}
                                    index={idx}
                                    active={activeQuestionIdx === idx}
                                    text={q.text}
                                    onClick={() => setActiveQuestionIdx(idx)}
                                />
                            ))}
                            <Button
                                variant="outline"
                                className="w-full mt-4 border-dashed border-2 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all font-bold"
                                onClick={addQuestion}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Question
                            </Button>
                        </div>
                    </Sidebar>
                )}

                {/* Center Content: Preview Canvas */}
                <main className={cn(
                    "flex-1 flex flex-col items-center transition-all duration-300 ease-in-out p-4 md:p-8 overflow-y-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px]",
                    !isPreviewMode && leftSidebarOpen ? "md:ml-[320px]" : "ml-0",
                    !isPreviewMode && rightSidebarOpen ? "md:mr-[320px]" : "mr-0"
                )}>
                    {isPreviewMode ? (
                        <div className={cn(
                            "transition-all duration-500 ease-in-out w-full flex justify-center",
                            previewMode === 'mobile' ? "max-w-[450px] h-full" : "max-w-4xl"
                        )}>
                            <div className={cn(
                                "w-full bg-white shadow-2xl transition-all duration-500 h-fit mb-20",
                                previewMode === 'mobile' ? "border-[12px] border-slate-900 rounded-[3rem] overflow-hidden" : "rounded-2xl border"
                            )}>
                                <PollViewer poll={{ title, questions, style, settings }} />
                            </div>
                        </div>
                    ) : (
                        /* Device Wrapper */
                        <div className={cn(
                            "transition-all duration-500 ease-in-out w-full flex justify-center",
                            previewMode === 'mobile' ? "max-w-[375px] h-full" : "max-w-4xl"
                        )}>
                            <Card className={cn(
                                "w-full shadow-2xl transition-all duration-500 mb-20 border-border dark:border-white/10",
                                previewMode === 'mobile' ? "min-h-full border-8 border-slate-900 rounded-[3rem] overflow-hidden" : "min-h-[500px]"
                            )} style={{
                                backgroundColor: style.backgroundColor,
                                color: style.textColor,
                                fontFamily: style.fontFamily,
                                borderRadius: previewMode === 'mobile' ? '3rem' : style.boxShape === 'rounded' ? '1.5rem' : style.boxShape === 'pill' ? '2.5rem' : '0',
                                border: previewMode === 'mobile' ? '8px solid #0f172a' : '1px solid var(--border)'
                            }}>
                                <CardContent className={cn(
                                    "p-8 md:p-12 space-y-10 transition-all duration-500",
                                    previewMode === 'mobile' && "p-6 py-12"
                                )}>
                                    {/* Title Input */}
                                    <div className="space-y-2">
                                        <Label className="sr-only">Poll Title</Label>
                                        <Input
                                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/30 h-auto leading-tight transition-all"
                                            style={{
                                                fontFamily: style.title?.fontFamily,
                                                fontSize: previewMode === 'mobile' ? `${Math.max(20, (style.title?.fontSize || 32) * 0.7)}px` : `${style.title?.fontSize}px`,
                                                fontWeight: style.title?.fontWeight,
                                                color: style.title?.color
                                            }}
                                            placeholder="Untitled Poll"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                        <div className="h-1 w-20 bg-emerald-500 rounded-full opacity-50" />
                                    </div>

                                    {/* Active Question Editor */}
                                    {questions[activeQuestionIdx] && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold opacity-30 uppercase tracking-widest">Question {activeQuestionIdx + 1}</span>
                                                    {questions.length > 1 && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => {
                                                            const newQs = questions.filter((_, i) => i !== activeQuestionIdx)
                                                            setQuestions(newQs)
                                                            setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Input
                                                    className="transition-all shadow-sm focus-visible:ring-0 px-4 py-6 h-auto"
                                                    style={{
                                                        fontFamily: style.question?.fontFamily,
                                                        fontSize: `${style.question?.fontSize}px`,
                                                        fontWeight: style.question?.fontWeight,
                                                        color: style.question?.color,
                                                        backgroundColor: style.question?.input.backgroundColor,
                                                        borderColor: style.question?.input.borderColor,
                                                        borderRadius: style.question?.input.borderShape === 'rounded' ? '0.75rem' : style.question?.input.borderShape === 'pill' ? '9999px' : '0',
                                                        borderWidth: '2px',
                                                        boxShadow: style.question?.input.shadow ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
                                                    }}
                                                    placeholder="What would you like to ask?"
                                                    value={questions[activeQuestionIdx].text}
                                                    onChange={(e) => updateQuestion(questions[activeQuestionIdx].id, e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                                                {questions[activeQuestionIdx].options.map((opt, oIdx) => (
                                                    <div key={opt.id} className="flex items-center gap-3 group relative">
                                                        <div
                                                            className="h-4 w-4 rounded-full border-2 transition-colors flex-none"
                                                            style={{ borderColor: style.option?.radio.activeColor }}
                                                        />
                                                        <div className="flex-1 relative">
                                                            <Input
                                                                className="transition-all shadow-sm focus-visible:ring-0 px-4 py-3 h-auto"
                                                                style={{
                                                                    fontFamily: style.option?.fontFamily,
                                                                    fontSize: `${style.option?.fontSize}px`,
                                                                    fontWeight: style.option?.fontWeight,
                                                                    color: style.option?.color,
                                                                    backgroundColor: style.option?.container.backgroundColor,
                                                                    borderColor: style.option?.container.borderColor || '#e2e8f0',
                                                                    borderRadius: style.option?.container.borderShape === 'rounded' ? '0.75rem' : style.option?.container.borderShape === 'pill' ? '9999px' : '0',
                                                                    borderWidth: '1px'
                                                                }}
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                value={opt.text}
                                                                onChange={(e) => updateOption(questions[activeQuestionIdx].id, opt.id, e.target.value)}
                                                            />
                                                        </div>
                                                        {questions[activeQuestionIdx].options.length > 2 && (
                                                            <Button variant="ghost" size="icon" className="md:opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500" onClick={() => removeOption(questions[activeQuestionIdx].id, opt.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button variant="outline" className="rounded-xl border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all font-bold mt-2" onClick={() => addOption(questions[activeQuestionIdx].id)}>
                                                    <Plus className="h-4 w-4 mr-2" /> Add Option
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>

                {/* Right Sidebar: Inspector (Hidden in Preview) */}
                {!isPreviewMode && (
                    <Sidebar
                        side="right"
                        isOpen={rightSidebarOpen}
                        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
                        title="Inspector"
                        icon={Palette}
                    >
                        <Accordion type="single" collapsible>
                            <AccordionItem value="design" title="Visual Style">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme Mode</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setStyle({ ...style, theme: 'default', backgroundColor: '#ffffff', textColor: '#000000' })}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                                    style.theme === 'default' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground"
                                                )}
                                            >
                                                <Sun className="h-5 w-5" />
                                                <span className="text-[10px] font-bold">LIGHT</span>
                                            </button>
                                            <button
                                                onClick={() => setStyle({ ...style, theme: 'dark', backgroundColor: '#0f172a', textColor: '#f8fafc' })}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                                                    style.theme === 'dark' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground"
                                                )}
                                            >
                                                <Moon className="h-5 w-5" />
                                                <span className="text-[10px] font-bold">DARK</span>
                                            </button>
                                        </div>
                                    </div>
                                    <ColorPicker label="Background" value={style.backgroundColor} onChange={(c) => setStyle({ ...style, backgroundColor: c })} />
                                </div>
                            </AccordionItem>

                            <AccordionItem value="title" title="Typography: Title">
                                <FontControls
                                    fontFamily={style.title?.fontFamily || "Inter, sans-serif"}
                                    fontSize={style.title?.fontSize || 32}
                                    fontWeight={style.title?.fontWeight || "bold"}
                                    color={style.title?.color || style.textColor}
                                    onUpdate={(u) => setStyle({ ...style, title: { ...style.title!, ...u } as any })}
                                />
                            </AccordionItem>

                            <AccordionItem value="question" title="Typography: Questions">
                                <div className="space-y-6">
                                    <FontControls
                                        fontFamily={style.question?.fontFamily || "Inter, sans-serif"}
                                        fontSize={style.question?.fontSize || 18}
                                        fontWeight={style.question?.fontWeight || "medium"}
                                        color={style.question?.color || style.textColor}
                                        onUpdate={(u) => setStyle({ ...style, question: { ...style.question!, ...u } as any })}
                                    />
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Input Field</Label>
                                        <div className="space-y-4">
                                            <ColorPicker label="Field Background" value={style.question?.input.backgroundColor || '#f8fafc'} onChange={(c) => setStyle({ ...style, question: { ...style.question!, input: { ...style.question!.input, backgroundColor: c } } })} />
                                            <ColorPicker label="Border Color" value={style.question?.input.borderColor || '#e2e8f0'} onChange={(c) => setStyle({ ...style, question: { ...style.question!, input: { ...style.question!.input, borderColor: c } } })} />
                                        </div>
                                    </div>
                                </div>
                            </AccordionItem>

                            <AccordionItem value="options" title="Typography: Options">
                                <div className="space-y-6">
                                    <FontControls
                                        fontFamily={style.option?.fontFamily || "Inter, sans-serif"}
                                        fontSize={style.option?.fontSize || 16}
                                        fontWeight={style.option?.fontWeight || "normal"}
                                        color={style.option?.color || style.textColor}
                                        onUpdate={(u) => setStyle({ ...style, option: { ...style.option!, ...u } as any })}
                                    />
                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Container Style</Label>
                                        <div className="space-y-4">
                                            <ColorPicker label="Background" value={style.option?.container.backgroundColor || '#ffffff'} onChange={(c) => setStyle({ ...style, option: { ...style.option!, container: { ...style.option!.container, backgroundColor: c } } })} />
                                            <ColorPicker label="Active Accent" value={style.option?.radio.activeColor || style.primaryColor} onChange={(c) => setStyle({ ...style, option: { ...style.option!, radio: { ...style.option!.radio, activeColor: c } } })} />
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-slate-400">Border Shape</Label>
                                                <Select value={style.option?.container.borderShape} onValueChange={(v: any) => setStyle({ ...style, option: { ...style.option!, container: { ...style.option!.container, borderShape: v } } })}>
                                                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="rounded">Rounded</SelectItem>
                                                        <SelectItem value="pill">Pill</SelectItem>
                                                        <SelectItem value="square">Square</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionItem>

                            <AccordionItem value="settings" title="Poll Settings">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-foreground">Multiple Options</Label>
                                            <p className="text-[10px] text-muted-foreground">Allow selecting {">"}1 answer</p>
                                        </div>
                                        <Switch checked={settings.allowMultipleVotes} onCheckedChange={(c) => setSettings({ ...settings, allowMultipleVotes: c })} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-foreground">Show Results</Label>
                                            <p className="text-[10px] text-muted-foreground">Reveal results after vote</p>
                                        </div>
                                        <Switch checked={settings.showResults} onCheckedChange={(c) => setSettings({ ...settings, showResults: c })} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-foreground">Allow Editing</Label>
                                            <p className="text-[10px] text-muted-foreground">Change vote later</p>
                                        </div>
                                        <Switch checked={settings.allowEditVote} onCheckedChange={(c) => setSettings({ ...settings, allowEditVote: c })} />
                                    </div>
                                </div>
                            </AccordionItem>
                        </Accordion>
                    </Sidebar>
                )}
            </div>

            {/* Publish Confirmation Dialog */}
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-4xl bg-card p-0 overflow-hidden border-border dark:border-white/10">
                    <div className="bg-primary/5 p-8 pb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <ArrowUpFromLine className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-foreground mb-2">Ready to launch?</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium pr-8">
                            Choose how you want to release your poll. You can publish instantly or schedule for later.
                        </DialogDescription>
                    </div>

                    <div className="p-8 space-y-4">
                        <Button
                            className="w-full h-14 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-bold flex items-center justify-between px-6 transition-all active:scale-[0.98]"
                            onClick={() => handleSave('published')}
                        >
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5" />
                                <span>Publish instantly</span>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-50" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-card px-4 text-muted-foreground">or schedule</span></div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="datetime-local"
                                    className="h-14 pl-11 rounded-2xl border-2 border-border bg-background/50 focus:ring-primary focus:border-primary font-medium"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-2xl border-2 border-border hover:bg-muted font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                                onClick={() => handleSave('scheduled', scheduledDate)}
                                disabled={!scheduledDate}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" /> Schedule for later
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function EditorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading Editor...</div>}>
            <EditorContent />
        </Suspense>
    )
}

export default EditorPage
