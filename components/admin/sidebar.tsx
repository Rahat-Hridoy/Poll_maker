"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, HelpCircle, Settings, MessageSquare, MonitorPlay } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()

    const mainLinks = [
        { href: "/admin/dashboard", label: "Polls", icon: BarChart3 },
        { href: "/admin/slides", label: "My Slide", icon: MonitorPlay },
        { href: "#", label: "Quiz", icon: HelpCircle, comingSoon: true },
        { href: "#", label: "Live Q&A", icon: MessageSquare, comingSoon: true },
    ]

    const settingsLink = { href: "/admin/settings", label: "Settings", icon: Settings }

    return (
        <div className="w-64 border-r bg-card h-screen sticky top-0 flex-col hidden md:flex">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-primary font-black">Poll</span>Maker
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {mainLinks.map((link) => {
                    const isActive = pathname === link.href && !link.comingSoon
                    return (
                        <div key={link.label} className="relative group">
                            <Link
                                href={link.href}
                                onClick={(e) => {
                                    if (link.comingSoon) {
                                        e.preventDefault()
                                        alert("This feature is coming soon!")
                                    }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground group-hover:translate-x-1"
                                    }`}
                            >
                                <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                                {link.label}
                                {link.comingSoon && (
                                    <span className="ml-auto text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase font-black">Soon</span>
                                )}
                            </Link>
                        </div>
                    )
                })}
            </nav>
            <div className="p-4 border-t space-y-4">
                <div className="relative group">
                    <Link
                        href={settingsLink.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground group-hover:translate-x-1"
                    >
                        <settingsLink.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        {settingsLink.label}
                    </Link>
                </div>
                <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest text-center">
                    v1.0.0
                </div>
            </div>
        </div>
    )
}
