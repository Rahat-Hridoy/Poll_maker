"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, HelpCircle, Layers, Settings, MessageSquare, LayoutDashboard } from "lucide-react"

export function Sidebar() {
    const pathname = usePathname()

    const links = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/dashboard", label: "Polls", icon: BarChart3 }, // Currently both point to dashboard as per wireframe logic roughly
        { href: "/admin/quiz", label: "Quiz", icon: HelpCircle },
        { href: "/admin/qna", label: "Live Q&A", icon: MessageSquare },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className="w-64 border-r bg-card h-full flex flex-col hidden md:flex">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-primary">Poll</span>Maker
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href && link.label !== "Polls" // Simple active check, refining if needed
                    return (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t text-xs text-muted-foreground text-center">
                v1.0.0
            </div>
        </div>
    )
}
