"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarClient() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4 z-[60]">
                <span className="text-xl font-bold text-blue-400">CF Admin</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {isMobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-[65] w-64 bg-slate-950 border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-16 flex items-center justify-center border-b border-white/10 mt-16 lg:mt-0">
                    <Link
                        href="/"
                        className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-300 hover:to-cyan-200 transition-all cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        COURTFLOW
                    </Link>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
                    <NavLink href="/admin/dashboard" icon="grid" label="Dashboard" active={pathname === '/admin/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/live" icon="activity" label="Live View" active={pathname === '/admin/live'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/bookings" icon="calendar" label="Bookings" active={pathname === '/admin/bookings'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/payments" icon="credit-card" label="Payments" active={pathname === '/admin/payments'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/members" icon="users" label="Members" active={pathname === '/admin/members'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/financials" icon="dollar-sign" label="Financials" active={pathname === '/admin/financials'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/data-management" icon="database" label="Data Management" active={pathname === '/admin/data-management'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/forecast-test" icon="zap" label="Forecast Test" active={pathname === '/admin/forecast-test'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/images" icon="image" label="Images" active={pathname === '/admin/images'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/help" icon="help-circle" label="Help Center" active={pathname === '/admin/help'} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLink href="/admin/settings" icon="settings" label="Settings" active={pathname === '/admin/settings'} onClick={() => setIsMobileMenuOpen(false)} />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                        <div>
                            <p className="text-sm font-bold text-white">Admin User</p>
                            <p className="text-xs text-gray-400">Club Manager</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    );
}

function NavLink({ href, icon, label, active = false, onClick }: { href: string; icon: string; label: string; active?: boolean; onClick?: () => void }) {
    const icons: Record<string, React.ReactNode> = {
        grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
        activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
        calendar: <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V8h14zM16 2v4M8 2v4" />,
        "credit-card": <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
        users: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
        "dollar-sign": <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
        database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></>,
        zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
        "help-circle": <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
        settings: <path d="M12.22 2h-.44a2 2 0 0 1-2-2 2 2 0 0 0-4 0 2 2 0 0 1-2 2H3a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2 2 2 0 0 0 0 4 2 2 0 0 1 2 2v.44a2 2 0 0 0 2 2h.44a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2 2 2 0 0 0 0-4 2 2 0 0 1-2-2V4a2 2 0 0 0-2-2z" />
    };

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-blue-400" : "text-gray-500 group-hover:text-white"}>
                {icons[icon]}
            </svg>
            <span className="font-medium">{label}</span>
        </Link>
    )
}
