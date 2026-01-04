
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight">PollMaker Admin</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="sm">Dashboard</Button>
                        </Link>
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                {children}
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        PollMaker Admin Panel
                    </p>
                </div>
            </footer>
        </div>
    );
}
