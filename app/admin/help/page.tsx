import { BarChart, Users, CreditCard, Calendar, Database, Zap, TrendingUp, Settings, ChevronRight, DollarSign, FileBarChart, Activity, Grid3x3 } from "lucide-react";
import Link from "next/link";

export default function AdminHelpPage() {
    const adminGuides = [
        {
            icon: BarChart,
            title: "Dashboard & Analytics",
            color: "from-blue-600 to-cyan-600",
            articles: [
                {
                    title: "Understanding the Smart Forecast Widget",
                    description: "Learn how AI predictions work and how to use them for staffing",
                    href: "/admin/help/forecast"
                },
                {
                    title: "Reading the Visual Court Grid",
                    description: "Court status colors, countdown timers, and quick actions",
                    href: "/admin/help/court-grid"
                },
                {
                    title: "Interpreting Analytics Data",
                    description: "Revenue trends, occupancy rates, and performance metrics",
                    href: "/admin/help/analytics"
                },
            ]
        },
        {
            icon: Calendar,
            title: "Booking Management",
            color: "from-purple-600 to-pink-600",
            articles: [
                {
                    title: "Managing Bookings",
                    description: "View, edit, cancel, and extend bookings",
                    href: "/admin/help/manage-bookings"
                },
                {
                    title: "Handling Cancellations",
                    description: "Cancellation policies, refunds, and customer communication",
                    href: "/admin/help/cancellations"
                },
                {
                    title: "Overbooking Prevention",
                    description: "How the system prevents double bookings",
                    href: "/admin/help/overbooking"
                },
            ]
        },
        {
            icon: CreditCard,
            title: "Payments & Refunds",
            color: "from-green-600 to-emerald-600",
            articles: [
                {
                    title: "Processing Refunds",
                    description: "Step-by-step guide to refunding customers via Mollie",
                    href: "/admin/help/refunds"
                },
                {
                    title: "Payment Status Tracking",
                    description: "Understanding paid, pending, and failed payments",
                    href: "/admin/help/payment-status"
                },
                {
                    title: "Revenue Reports",
                    description: "Generating financial reports and VAT breakdown",
                    href: "/admin/help/revenue"
                },
            ]
        },
        {
            icon: Users,
            title: "Member Management",
            color: "from-yellow-600 to-orange-600",
            articles: [
                {
                    title: "Managing Memberships",
                    description: "Upgrade, downgrade, and cancel member subscriptions",
                    href: "/admin/help/memberships"
                },
                {
                    title: "Member Communication",
                    description: "Sending emails and notifications to members",
                    href: "/admin/help/communication"
                },
                {
                    title: "Loyalty Points Management",
                    description: "Manually award or deduct points",
                    href: "/admin/help/loyalty"
                },
            ]
        },
        {
            icon: Database,
            title: "Data Management",
            color: "from-indigo-600 to-purple-600",
            articles: [
                {
                    title: "Historical Data Backfill",
                    description: "Populating occupancy history for better forecasts",
                    href: "/admin/help/backfill"
                },
                {
                    title: "Data Export",
                    description: "Exporting bookings, members, and financial data",
                    href: "/admin/help/export"
                },
                {
                    title: "Database Maintenance",
                    description: "Best practices for data hygiene",
                    href: "/admin/help/maintenance"
                },
            ]
        },
        {
            icon: Settings,
            title: "Image Management",
            color: "from-pink-600 to-rose-600",
            articles: [
                {
                    title: "Uploading Custom Images",
                    description: "How to upload your own court and action photos",
                    href: "/admin/help/image-upload"
                },
                {
                    title: "Image Specifications",
                    description: "Recommended sizes, formats, and quality guidelines",
                    href: "/admin/help/image-specs"
                },
                {
                    title: "Managing Image Library",
                    description: "Organizing, activating, and deleting images",
                    href: "/admin/help/image-library"
                },
            ]
        },
        {
            icon: TrendingUp,
            title: "Promotions & Marketing",
            color: "from-red-600 to-pink-600",
            articles: [
                {
                    title: "Creating Promo Codes",
                    description: "Setting up discount codes with rules and limits",
                    href: "/admin/help/promo-codes"
                },
                {
                    title: "Running Campaigns",
                    description: "Seasonal promotions and flash sales",
                    href: "/admin/help/campaigns"
                },
                {
                    title: "Tracking Promotion Performance",
                    description: "Measuring ROI of marketing efforts",
                    href: "/admin/help/promo-analytics"
                },
            ]
        },
    ];

    const quickActions = [
        {
            title: "Process a Refund",
            description: "Go to Payments → Find booking → Click Refund",
            icon: DollarSign,
            color: "from-green-600 to-emerald-600",
            href: "/admin/payments"
        },
        {
            title: "Backfill Historical Data",
            description: "Go to Data Management → Run Backfill",
            icon: FileBarChart,
            color: "from-blue-600 to-cyan-600",
            href: "/admin/data-management"
        },
        {
            title: "View Forecast",
            description: "Dashboard → Smart Forecast Widget",
            icon: Activity,
            color: "from-purple-600 to-pink-600",
            href: "/admin/dashboard"
        },
        {
            title: "Check Court Status",
            description: "Dashboard → Visual Court Grid",
            icon: Grid3x3,
            color: "from-orange-600 to-red-600",
            href: "/admin/dashboard"
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>

                    <h1 className="text-5xl font-bold text-white mb-4">Admin Help Center</h1>
                    <p className="text-xl text-gray-400">
                        Everything you need to manage your court facility like a pro
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mb-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm">{action.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Admin Guides */}
                <div className="space-y-12">
                    {adminGuides.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.title}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {category.articles.map((article) => (
                                        <Link
                                            key={article.title}
                                            href={article.href}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex-1">
                                                    {article.title}
                                                </h3>
                                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                            </div>
                                            <p className="text-gray-400 text-sm">{article.description}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Video Tutorials */}
                <div className="mt-16 bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-3xl font-bold text-white mb-6">Video Tutorials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-2xl p-6">
                            <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl mb-4 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Getting Started with Admin Dashboard</h3>
                            <p className="text-gray-400 text-sm">5 min overview of all admin features</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6">
                            <div className="aspect-video bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl mb-4 flex items-center justify-center">
                                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-bold mb-2">Processing Refunds</h3>
                            <p className="text-gray-400 text-sm">Step-by-step refund tutorial</p>
                        </div>
                    </div>
                </div>

                {/* Support Contact */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
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
