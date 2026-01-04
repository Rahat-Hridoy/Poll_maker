"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, ExternalLink, Check, Plus, Trash2, GripVertical, Save } from "lucide-react"

import { createPoll } from "@/app/actions"

export function PollForm({ initialData = null }: { initialData?: any }) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [questions, setQuestions] = useState<any[]>(initialData?.questions || [
        { id: Date.now(), text: "", type: "single", options: [{ id: Date.now() + 1, text: "" }, { id: Date.now() + 2, text: "" }] }
    ])

    // Success Dialog State
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [generatedLink, setGeneratedLink] = useState("")
    const [copied, setCopied] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                text: "",
                type: "single",
                options: [{ id: Date.now() + 1, text: "" }, { id: Date.now() + 2, text: "" }]
            }
        ])
    }

    const removeQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const updateQuestion = (id: number, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
    }

    const addOption = (questionId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: [...q.options, { id: Date.now(), text: "" }] }
            }
            return q
        }))
    }

    const removeOption = (questionId: number, optionId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return { ...q, options: q.options.filter((o: any) => o.id !== optionId) }
            }
            return q
        }))
    }

    const updateOption = (questionId: number, optionId: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    options: q.options.map((o: any) => o.id === optionId ? { ...o, text } : o)
                }
            }
            return q
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await createPoll({ title, description, questions });
            if (result.success) {
                const link = `${window.location.origin}/poll/${result.pollId}`
                setGeneratedLink(link)
                setShowSuccessDialog(true)
                // Reset form
                setTitle("")
                setDescription("")
                setQuestions([{ id: Date.now(), text: "", type: "single", options: [{ id: Date.now() + 1, text: "" }, { id: Date.now() + 2, text: "" }] }])
            }
        } catch (error) {
            console.error(error)
            alert("Failed to create poll")
        } finally {
            setIsSubmitting(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Poll Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Employee Engagement Survey"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Briefly describe what this poll is about..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <Card key={question.id} className="relative">
                            <div className="absolute right-4 top-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => removeQuestion(question.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium">Question {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Question Text</Label>
                                    <Input
                                        value={question.text}
                                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                                        placeholder="What would you like to ask?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Answer Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={question.type}
                                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                                    >
                                        <option value="single">Single Choice</option>
                                        <option value="multiple">Multiple Choice</option>
                                    </select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label>Options</Label>
                                    {question.options.map((option: any, optIndex: number) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                                            <Input
                                                value={option.text}
                                                onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                                placeholder={`Option ${optIndex + 1}`}
                                                className="flex-1"
                                            />
                                            {question.options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(question.id, option.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => addOption(question.id)}
                                    >
                                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Option
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addQuestion}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" /> Save & Publish Poll
                    </Button>
                </div>
            </form>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Poll Published Successfully! 🎉</DialogTitle>
                        <DialogDescription>
                            Your poll is ready to share. Copy the link below to start gathering responses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link"
                                defaultValue={generatedLink}
                                readOnly
                            />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
                            <span className="sr-only">Copy</span>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => window.open(generatedLink, '_blank')}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Poll
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
