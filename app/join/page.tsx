'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { joinPresentationAction } from "@/app/actions/audience"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRight } from "lucide-react"

export default function JoinPage() {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length < 5) {
            setError("Code must be at least 5 digits")
            return
        }

        setLoading(true)
        setError("")

        try {
            const result = await joinPresentationAction(code)
            if (result.success && result.presentationId) {
                router.push(`/live/${result.presentationId}`)
            } else {
                setError(result.error || "Invalid code")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Join Presentation</h1>
                    <p className="text-slate-500">Enter the 5-digit code displayed on the screen</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="12345"
                            className="text-center text-4xl tracking-[0.5em] font-mono h-20 uppercase placeholder:tracking-normal placeholder:text-2xl"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={5}
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2" />}
                        Join Session
                    </Button>
                </form>

                <p className="text-xs text-slate-400">
                    By joining, you agree to participate in the live session.
                </p>
            </div>
        </div>
    )
}
