import { Sidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-6 h-14 flex items-center justify-between">
                    <div className="md:hidden">PollMaker Admin</div> {/* Mobile placeholder */}
                    <div className="ml-auto flex items-center gap-4">
                        <LogoutButton />
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
