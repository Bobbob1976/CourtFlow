import Link from "next/link";
import SidebarClient from "@/components/admin/SidebarClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    // 1. Check Logged In
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Check Role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Allow Admins & Owners
    const isAdmin = profile?.role === 'admin' || profile?.role === 'club_owner' || profile?.role === 'super_admin';

    // TEMPORARY: Allow access if no profile found yet (race condition) or for dev 
    // BUT user asked to secure it. So stick to logic.
    // If you lock yourself out -> Go to Supabase > user_profiles > Set your role to 'admin'
    if (!isAdmin) {
        redirect("/"); // Kick them out to homepage
    }

    return (
        <div className="flex h-screen text-white font-sans overflow-hidden">
            {/* Sidebar (Client Component for Mobile Responsiveness) */}
            <SidebarClient />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative pt-16 lg:pt-0">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#121212]/50 backdrop-blur-md z-10 hidden lg:flex">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-white">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                            SYSTEM ONLINE
                        </span>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            + New Booking
                        </button>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {children}
                </div>
            </main>
        </div>
    );
}
