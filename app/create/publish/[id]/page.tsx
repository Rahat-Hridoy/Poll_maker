"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy, Check, ExternalLink, QrCode, Calendar, ArrowRight } from "lucide-react"
import { QRCodeDialog } from "@/components/admin/qr-code-dialog"

export default function PublishPage() {
    const params = useParams()
    const router = useRouter()
    const pollId = params.id as string

    // In a real app we might fetch the poll here to show title, but for now we trust the ID.
    const pollLink = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}` : `.../poll/${pollId}`

    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pollLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                        <Check className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Your Poll is Ready!</CardTitle>
                    <CardDescription className="text-lg">
                        Share it with your audience to start collecting responses.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Link Section */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground ml-1">Poll Link</div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    className="pr-10 font-medium bg-muted/30"
                                    value={pollLink}
                                    readOnly
                                />
                            </div>
                            <Button onClick={copyToClipboard} className="shrink-0" variant="secondary">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => window.open(pollLink, '_blank')}>
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <ExternalLink className="h-6 w-6" />
                            </div>
                            <div className="font-medium text-sm">Open Poll</div>
                        </div>

                        <QRCodeDialog
                            url={pollLink}
                            title="Poll QR Code"
                            trigger={
                                <div className="border rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center hover:bg-muted/30 transition-colors cursor-pointer">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                        <QrCode className="h-6 w-6" />
                                    </div>
                                    <div className="font-medium text-sm">Get QR Code</div>
                                </div>
                            }
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4 border-t">
                        <Button size="lg" className="w-full text-lg" onClick={() => router.push('/admin/dashboard')}>
                            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-1/2" disabled>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule (Paid)
                            </Button>
                            <Button variant="ghost" className="w-1/2" onClick={() => router.push(`/create/editor?id=${pollId}`)}>
                                Edit Poll
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
