"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { VoteChart } from "@/components/poll/vote-chart"
import { CheckCircle2 } from "lucide-react"

import { submitVote } from "@/app/actions"

export function PollViewer({ poll }: { poll: any }) {
    const [hasVoted, setHasVoted] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({})
    const [voterName, setVoterName] = useState("")
    const [voterEmail, setVoterEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (hasVoted) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Thank you for voting!</h2>
                    <p className="text-muted-foreground">Your response has been recorded.</p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">Live Results</h3>
                    {poll.questions.map((q: any) => (
                        <VoteChart
                            key={q.id}
                            question={q.text}
                            data={q.options.map((o: any) => ({ name: o.text, votes: o.votes + (selectedOptions[q.id] === o.id ? 1 : 0) }))}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">{poll.title}</h1>
                <p className="text-muted-foreground">{poll.description}</p>
            </div>

            <div className="space-y-6">
                {/* Voter Identity Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Your Information</CardTitle>
                        <CardDescription>Please enter your details to vote.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">First Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter your first name"
                                value={voterName}
                                onChange={(e) => setVoterName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={voterEmail}
                                onChange={(e) => setVoterEmail(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {poll.questions.map((question: any, index: number) => (
                    <Card key={question.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">
                                {index + 1}. {question.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedOptions[question.id] as string}
                                onValueChange={(val) => handleOptionChange(question.id, val)}
                                className="grid gap-3"
                            >
                                {question.options.map((option: any) => (
                                    <div key={option.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent transition-colors has-checked:border-primary has-checked:bg-accent">
                                        <RadioGroupItem value={option.id} id={option.id} />
                                        <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                                            {option.text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={
                        Object.keys(selectedOptions).length !== poll.questions.length ||
                        !voterName.trim() ||
                        !voterEmail.trim()
                    }
                >
                    Submit Vote
                </Button>
            </div>
        </div>
    )
}
