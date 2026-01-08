"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Palette, Save, ArrowLeft, Plus, Trash2, GripVertical, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PollQuestion, PollSettings, PollStyle, POLL_TEMPLATES } from "@/lib/data"
import { createPoll } from "@/app/actions"

export default function EditorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateName = searchParams.get('template')

    // Initial State Setup
    const template = POLL_TEMPLATES.find(t => t.name === templateName) || POLL_TEMPLATES[0]

    const [title, setTitle] = useState("")
    const [questions, setQuestions] = useState<PollQuestion[]>([
        { id: "1", text: "", type: "single", options: [{ id: "o1", text: "", votes: 0 }, { id: "o2", text: "", votes: 0 }] }
    ])

    const [settings, setSettings] = useState<PollSettings>({
        allowMultipleVotes: false,
        showResults: true,
        allowEditVote: true
    })

    const [style, setStyle] = useState<PollStyle>(template.style)
    const [activeTab, setActiveTab] = useState<'settings' | 'styling' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handlers (Simplified version of PollForm logic)
    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now().toString(), text: "", type: settings.allowMultipleVotes ? "multiple" : "single", options: [{ id: Date.now().toString() + "1", text: "", votes: 0 }, { id: Date.now().toString() + "2", text: "", votes: 0 }] }])
    }

    const updateQuestion = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
    }

    const updateOption = (qId: string, oId: string, text: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) } : q))
    }

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, { id: Date.now().toString(), text: "", votes: 0 }] } : q))
    }

    const handleSave = async (draft = false) => {
        setIsSubmitting(true)
        try {
            const result = await createPoll({
                title: title || "Untitled Poll",
                questions,
                status: draft ? 'draft' : 'published', // In wireframe, Save goes to Publish screen really
                style,
                settings
            })
            if (result.success) {
                if (draft) {
                    router.push('/admin/dashboard')
                } else {
                    router.push(`/create/publish/${result.pollId}`)
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Apply Global Settings to Questions
    useEffect(() => {
        setQuestions(qs => qs.map(q => ({
            ...q,
            type: settings.allowMultipleVotes ? 'multiple' : 'single'
        })))
    }, [settings.allowMultipleVotes])


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="font-semibold text-lg">{title || "Untitled Poll"}</div>
                <div className="flex gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full border-2 border-dashed border-gray-300 hover:border-primary text-gray-500 hover:text-primary">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Poll Settings</SheetTitle>
                                <SheetDescription>Configure how your poll works.</SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="multiple">Multiple Option</Label>
                                    <Switch id="multiple" checked={settings.allowMultipleVotes} onCheckedChange={(c) => setSettings({ ...settings, allowMultipleVotes: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="results">Result show</Label>
                                    <Switch id="results" checked={settings.showResults} onCheckedChange={(c) => setSettings({ ...settings, showResults: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit">Can Edit vote</Label>
                                    <Switch id="edit" checked={settings.allowEditVote} onCheckedChange={(c) => setSettings({ ...settings, allowEditVote: c })} />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full border-2 border-dashed border-gray-300 hover:border-primary text-gray-500 hover:text-primary">
                                <Palette className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Visual Styling</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <div className="space-y-2">
                                    <Label>Font Family</Label>
                                    <Select value={style.fontFamily} onValueChange={(v) => setStyle({ ...style, fontFamily: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                                            <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                            <SelectItem value="'Courier New', monospace">Courier</SelectItem>
                                            <SelectItem value="'Comic Sans MS', cursive">Playful</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select value={style.theme} onValueChange={(v) => {
                                        // Simple theme logic for now
                                        const t = POLL_TEMPLATES.find(pt => pt.style.theme === v);
                                        if (t) setStyle(t.style);
                                        else setStyle({ ...style, theme: v })
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="dark">Dark Mode</SelectItem>
                                            <SelectItem value="professional">Professional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Box Shape</Label>
                                    <div className="flex gap-2">
                                        <div onClick={() => setStyle({ ...style, boxShape: 'rounded' })} className={`h-10 w-10 border rounded bg-gray-100 cursor-pointer ${style.boxShape === 'rounded' ? 'ring-2 ring-primary' : ''}`} />
                                        <div onClick={() => setStyle({ ...style, boxShape: 'square' })} className={`h-10 w-10 border rounded-none bg-gray-100 cursor-pointer ${style.boxShape === 'square' ? 'ring-2 ring-primary' : ''}`} />
                                        <div onClick={() => setStyle({ ...style, boxShape: 'pill' })} className={`h-10 w-10 border rounded-full bg-gray-100 cursor-pointer ${style.boxShape === 'pill' ? 'ring-2 ring-primary' : ''}`} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Colors</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs">Background</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input type="color" className="h-8 w-8 p-0" value={style.backgroundColor} onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs">Text</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input type="color" className="h-8 w-8 p-0" value={style.textColor} onChange={(e) => setStyle({ ...style, textColor: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                <Card className="w-full max-w-2xl h-fit min-h-[500px] shadow-xl transition-all duration-300" style={{
                    backgroundColor: style.backgroundColor,
                    color: style.textColor,
                    fontFamily: style.fontFamily,
                    borderRadius: style.boxShape === 'rounded' ? '1rem' : style.boxShape === 'pill' ? '2rem' : '0'
                }}>
                    <CardContent className="p-8 space-y-8">
                        {/* Title Input */}
                        <Input
                            className="text-3xl font-bold border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50 h-auto"
                            placeholder="Poll Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {questions.map((q, qIdx) => (
                            <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <Input
                                    className="text-xl font-medium border-none bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
                                    placeholder="Poll Question"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                                />

                                <div className="space-y-3 pl-2 border-l-2 border-muted/20">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={opt.id} className="flex items-center gap-3 group">
                                            <div className="h-4 w-4 rounded-full border-2 border-muted" />
                                            <Input
                                                className="border-none bg-transparent shadow-none focus-visible:ring-0 px-2 h-auto py-1"
                                                placeholder={`Option ${oIdx + 1}`}
                                                value={opt.text}
                                                onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary pl-1" onClick={() => addOption(q.id)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add option
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Bar */}
            <div className="h-20 border-t bg-white flex items-center justify-between px-6 sticky bottom-0 z-10">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-destructive hover:text-destructive" onClick={() => router.push('/')}>
                    Cancel
                </Button>

                <div className="flex gap-4">
                    <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={() => handleSave(true)} disabled={isSubmitting}>
                        Save as Draft
                    </Button>
                    <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-primary/25" onClick={() => handleSave(false)} disabled={isSubmitting}>
                        <Save className="h-5 w-5 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save & Continue'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
