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
        <div className="space-y-8 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 text-center"
            >
                <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-1">
                    {poll.title}
                </h1>
                <p className="text-muted-foreground text-lg">{poll.description}</p>
            </motion.div>

            <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{
                visible: { transition: { staggerChildren: 0.1 } }
            }}>
                {/* Voter Identity Section */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <Card className="border-primary/20 shadow-sm">
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
                                    className="focus-visible:ring-primary"
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
                                    className="focus-visible:ring-primary"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {poll.questions.map((question: any, index: number) => (
                    <motion.div key={question.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium">
                                    <span className="text-primary mr-2">{index + 1}.</span>
                                    {question.text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={selectedOptions[question.id] as string}
                                    onValueChange={(val) => handleOptionChange(question.id, val)}
                                    className="grid gap-3"
                                >
                                    {question.options.map((option: any) => (
                                        <div key={option.id} className={`flex items-center space-x-3 space-y-0 rounded-lg border p-4 transition-all duration-200 cursor-pointer ${selectedOptions[question.id] === option.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50 hover:border-primary/50'}`}>
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium text-base">
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
                    disabled={
                        Object.keys(selectedOptions).length !== poll.questions.length ||
                        !voterName.trim() ||
                        !voterEmail.trim() ||
                        isSubmitting
                    }
                >
                    {isSubmitting ? "Submitting..." : "Submit Vote"}
                </Button>
            </motion.div>
        </div>
    )
}
