"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, User, Menu } from "lucide-react";

export default function MobileBottomNav({ clubId }: { clubId?: string }) {
    const pathname = usePathname();

    const navItems = [
        {
            href: clubId ? `/${clubId}` : "/",
            icon: Home,
            label: "Home",
            active: pathname === `/${clubId}` || pathname === "/",
        },
        {
            href: "/dashboard",
            icon: Calendar,
            label: "Bookings",
            active: pathname === "/dashboard",
        },
        {
            href: "/matches",
            icon: Users,
            label: "Matches",
            active: pathname === "/matches",
        },
        {
            href: "/profile",
            icon: User,
            label: "Profile",
            active: pathname === "/profile",
        },
    ];

    return (
        <>
            {/* Mobile Bottom Navigation - Only visible on mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${item.active
                                        ? "text-blue-400"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${item.active ? "scale-110" : ""}`} />
                                <span className="text-xs font-medium">{item.label}</span>
                                {item.active && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-400 rounded-t-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Spacer to prevent content from being hidden behind bottom nav */}
            <div className="lg:hidden h-16" />
        </>
    );
}
