"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy, Check, QrCode, Calendar, ArrowRight, Download, Share2, Globe, LayoutDashboard, Clock } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { updatePollStatus } from '@/app/actions'
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function PublishPage() {
    const params = useParams()
    const router = useRouter()
    const pollId = params.id as string
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const pollLink = `${baseUrl}/poll/${pollId}`

    const [copiedLink, setCopiedLink] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [scheduledDate, setScheduledDate] = useState("")
    const [isScheduling, setIsScheduling] = useState(false)

    // For downloading QR
    const qrRef = useRef<HTMLDivElement>(null)

    const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
        navigator.clipboard.writeText(text)
        setFn(true)
        setTimeout(() => setFn(false), 2000)
    }

    const downloadQR = () => {
        const svg = document.getElementById("poll-qr-code");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `poll-${pollId}-qr.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true)
        try {
            await updatePollStatus(pollId, 'published')
            router.push('/admin/dashboard')
        } catch (error) {
            console.error(error)
        } finally {
            setIsPublishing(false)
        }
    }

    const handleSchedule = async () => {
        if (!scheduledDate) return;
        setIsScheduling(true)
        try {
            await updatePollStatus(pollId, 'scheduled', scheduledDate)
            router.push('/admin/dashboard')
        } catch (error) {
            console.error(error)
        } finally {
            setIsScheduling(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-4 relative">
            {/* Content Card (The "Popup") */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg"
            >
                <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Ready to Publish?
                        </CardTitle>
                        <CardDescription>
                            Share your poll with the world.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 p-6 md:p-8">
                        {/* Link Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Poll Link</label>
                            </div>
                            <div className="flex gap-2 p-1.5 border rounded-xl bg-slate-50 focus-within:ring-2 ring-indigo-100 transition-all">
                                <div className="flex-1 flex items-center px-2 text-slate-600 truncate font-medium">
                                    <Globe className="w-4 h-4 mr-2 text-slate-400" />
                                    {pollLink}
                                </div>
                                <Button
                                    size="sm"
                                    className={`rounded-lg transition-all ${copiedLink ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-white text-slate-700 hover:bg-slate-100 border shadow-sm'}`}
                                    onClick={() => copyToClipboard(pollLink, setCopiedLink)}
                                >
                                    {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Secret Code Removed */}

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="bg-white p-2 rounded-xl shadow-sm" ref={qrRef}>
                                <QRCodeSVG
                                    id="poll-qr-code"
                                    value={pollLink}
                                    size={120}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm" className="h-8 text-xs rounded-full border-slate-200 hover:border-indigo-300 hover:text-indigo-600" onClick={() => copyToClipboard(pollLink, setCopiedLink)}>
                                    <Copy className="mr-1.5 h-3 w-3" /> Copy Link
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-xs rounded-full border-slate-200 hover:border-indigo-300 hover:text-indigo-600" onClick={downloadQR}>
                                    <Download className="mr-1.5 h-3 w-3" /> Download PNG
                                </Button>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="lg" className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
                                        <Calendar className="mr-2 h-4 w-4" /> Schedule Publish
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Schedule Publication</DialogTitle>
                                        <DialogDescription>
                                            Choose a date and time to automatically publish this poll.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="date" className="text-right">
                                                Date & Time
                                            </Label>
                                            <Input
                                                id="date"
                                                type="datetime-local"
                                                className="col-span-3"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleSchedule} disabled={isScheduling || !scheduledDate}>
                                            {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all font-semibold" onClick={handlePublish} disabled={isPublishing}>
                                {isPublishing ? 'Publishing...' : 'Publish Now'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Dashboard (Outside Card) */}
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="link"
                        className="text-white/80 hover:text-white hover:no-underline flex items-center gap-2 transition-colors"
                        onClick={() => router.push('/admin/dashboard')}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
