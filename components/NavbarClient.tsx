"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { createClient } from "@/utils/supabase/client";

interface NavbarClientProps {
    user: any;
    userRole?: string | null;
}

export default function NavbarClient({ user, userRole }: NavbarClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { t, locale, setLocale } = useLanguage();

    const [fetchedRole, setFetchedRole] = useState<string | null>(userRole || null);
    const [debugError, setDebugError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        async function verifyRole() {
            if (!user) return;
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Role Fetch Error:", error);
                if (!userRole) setDebugError("Role Error");
            } else if (data) {
                setFetchedRole(data.role);
            }
        }
        verifyRole();
    }, [user]);

    const activeRole = fetchedRole || userRole;
    const isAdmin = activeRole === 'admin' || activeRole === 'club_owner' || activeRole === 'super_admin';

    const toggleLanguage = () => {
        setLocale(locale === 'nl' ? 'en' : 'nl');
    };

    const mobileMenu = (
        <div className="lg:hidden">
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-950 z-50 shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.webp"
                            alt="CourtFlow"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-400">
                            COURTFLOW
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="h-full overflow-y-auto px-3 py-6">
                    <div className="px-3 mb-6">
                        <button
                            onClick={toggleLanguage}
                            className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm text-gray-300 hover:bg-white/10"
                        >
                            <span className="text-xl">{locale === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
                            {locale === 'nl' ? 'Nederlands' : 'English'}
                        </button>
                    </div>

                    {user ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                    {user.email?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{user.email?.split('@')[0]}</p>
                                    <p className="text-xs text-gray-400">Online</p>
                                </div>
                            </div>

                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                </svg>
                                {t.nav.dashboard}
                            </Link>

                            <Link
                                href="/wallet"
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                                </svg>
                                {t.nav.wallet}
                            </Link>

                            <div className="my-4 border-t border-white/10"></div>

                            <Link
                                href="/help"
                                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                                {t.nav.help}
                            </Link>

                            <div className="my-4 border-t border-white/10"></div>

                            {isAdmin && (
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                    {t.nav.admin}
                                </Link>
                            )}

                            <form action={logout} className="mt-6 pt-6 border-t border-white/10">
                                <button
                                    type="submit"
                                    className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                    </svg>
                                    {t.nav.logout}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                            {t.nav.login}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 group flex items-center gap-3">
                        <img
                            src="/logo.webp"
                            alt="CourtFlow Logo"
                            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-green-400 transition-all">
                            CourtFlow
                        </span>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="relative -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="hidden lg:flex lg:gap-x-8">
                    {user && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium leading-6 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                {t.nav.dashboard}
                            </Link>
                            <Link href="/profile" className="text-sm font-medium leading-6 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                Profiel
                            </Link>
                            <Link href="/wallet" className="text-sm font-medium leading-6 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                {t.nav.wallet}
                            </Link>
                            <Link href="/help" className="text-sm font-medium leading-6 text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">
                                {t.nav.help}
                            </Link>
                            {isAdmin && (
                                <Link href="/admin/dashboard" className="text-sm font-medium leading-6 text-blue-400 hover:text-blue-300 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 border border-blue-500/20">
                                    {t.nav.admin}
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <button
                        onClick={toggleLanguage}
                        className="mr-6 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 transition-colors flex items-center gap-2"
                        title="Switch Language"
                    >
                        <span>{locale === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
                        <span className="opacity-50 mx-1">|</span>
                        <span>{locale === 'nl' ? 'NL' : 'EN'}</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-x-4">
                            <div className="text-right mr-2">
                                <p className="text-xs text-gray-400 font-medium">Online</p>
                                <p className="text-sm text-white font-bold">{user.email?.split('@')[0]}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border-2 border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-900/20 ring-2 ring-transparent hover:ring-blue-500/50 transition-all cursor-pointer">
                                {user.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <form action={logout}>
                                <button type="submit" className="text-xs font-medium text-gray-500 hover:text-red-400 transition-colors ml-2">
                                    ({t.nav.logout})
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-bold leading-6 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/5 transition-all">
                            {t.nav.login} <span aria-hidden="true">&rarr;</span>
                        </Link>
                    )}
                </div>
            </nav>

            {mounted && createPortal(mobileMenu, document.body)}
        </>
    );
}
