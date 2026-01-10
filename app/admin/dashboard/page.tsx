import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPolls } from "@/lib/store";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ImportButton } from "@/components/admin/import-button";
import { PollList } from "@/components/admin/poll-list";

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_session')?.value;

    if (!userId) {
        redirect('/login');
    }

    const polls = await getPolls(userId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        My Polls
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">Create, manage and analyze your audience engagement.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/create/editor?template=Blank%20Canvas">
                        <Button className="shadow-lg hover:shadow-primary/25 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Create New Poll
                        </Button>
                    </Link>
                    <ImportButton />
                </div>
            </div>

            <PollList polls={polls} />
        </div>
    );
}
