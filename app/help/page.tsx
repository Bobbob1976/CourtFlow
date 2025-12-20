import { Book, Zap, CreditCard, Users, Gift, TrendingUp, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
    const categories = [
        {
            icon: Book,
            title: "Getting Started",
            description: "Learn the basics of CourtFlow",
            articles: [
                { title: "How to create your first booking", href: "/help/first-booking" },
                { title: "Setting up your profile", href: "/help/profile-setup" },
                { title: "Understanding court availability", href: "/help/availability" },
                { title: "Payment methods explained", href: "/help/payments" },
            ]
        },
        {
            icon: CreditCard,
            title: "Payments & Wallet",
            description: "Manage your payments and wallet",
            articles: [
                { title: "How to top up your wallet", href: "/help/wallet-topup" },
                { title: "Payment methods", href: "/help/payment-methods" },
                { title: "Refund policy", href: "/help/refunds" },
                { title: "Invoices and receipts", href: "/help/invoices" },
            ]
        },
        {
            icon: Users,
            title: "Memberships",
            description: "Everything about membership plans",
            articles: [
                { title: "Membership tiers explained", href: "/help/membership-tiers" },
                { title: "How to upgrade your membership", href: "/help/upgrade" },
                { title: "Membership benefits", href: "/help/benefits" },
                { title: "Cancelling your membership", href: "/help/cancel-membership" },
            ]
        },
        {
            icon: Gift,
            title: "Loyalty & Rewards",
            description: "Earn points and redeem rewards",
            articles: [
                { title: "How to earn loyalty points", href: "/help/earn-points" },
                { title: "Redeeming rewards", href: "/help/redeem-rewards" },
                { title: "Tier progression", href: "/help/tiers" },
                { title: "Points expiration policy", href: "/help/points-expiry" },
            ]
        },
        {
            icon: Zap,
            title: "Bookings",
            description: "Manage your court reservations",
            articles: [
                { title: "How to book a court", href: "/help/book-court" },
                { title: "Cancelling a booking", href: "/help/cancel-booking" },
                { title: "Extending your booking", href: "/help/extend-booking" },
                { title: "Split payment with friends", href: "/help/split-payment" },
            ]
        },
        {
            icon: TrendingUp,
            title: "Promotions",
            description: "Save money with promo codes",
            articles: [
                { title: "How to use promo codes", href: "/help/promo-codes" },
                { title: "Current promotions", href: "/help/current-promos" },
                { title: "Referral program", href: "/help/referrals" },
                { title: "Birthday rewards", href: "/help/birthday" },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
                        <HelpCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Help Center</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Find answers to your questions and learn how to get the most out of CourtFlow
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-12"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div
                                key={category.title}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{category.title}</h3>
                                        <p className="text-sm text-gray-400">{category.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {category.articles.map((article) => (
                                        <Link
                                            key={article.title}
                                            href={article.href}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                        >
                                            <span className="text-gray-300 group-hover:text-white text-sm">
                                                {article.title}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/help/contact"
                            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-bold">Contact Support</p>
                                <p className="text-gray-400 text-sm">Get help from our team</p>
                            </div>
                        </Link>

                        <Link
                            href="/changelog"
                            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-bold">What's New</p>
                                <p className="text-gray-400 text-sm">Latest features & updates</p>
                            </div>
                        </Link>

                        <Link
                            href="/help/faq"
                            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-bold">FAQ</p>
                                <p className="text-gray-400 text-sm">Frequently asked questions</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Still Need Help */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Still can't find what you're looking for?</p>
                    <Link
                        href="/help/contact"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
