import { Sparkles, Check, Clock, Zap } from "lucide-react";

export default function ChangelogPage() {
    const updates = [
        {
            version: "2.0.0",
            date: "December 2025",
            status: "latest",
            title: "Major Platform Update",
            description: "Complete redesign with AI-powered features and business tools",
            features: [
                {
                    category: "AI & Intelligence",
                    icon: "🤖",
                    items: [
                        "Smart occupancy forecasting with 85-95% accuracy",
                        "Weather-based demand predictions",
                        "Real-time court status monitoring",
                        "Historical data analytics",
                        "Automated staffing recommendations"
                    ]
                },
                {
                    category: "Payment System",
                    icon: "💳",
                    items: [
                        "Mollie payment integration",
                        "Instant refund processing",
                        "Digital wallet system",
                        "Split payment with friends",
                        "Automatic invoicing"
                    ]
                },
                {
                    category: "Membership & Loyalty",
                    icon: "⭐",
                    items: [
                        "3-tier membership system (Basic, Premium, VIP)",
                        "Loyalty points on every booking",
                        "Rewards catalog with exclusive perks",
                        "Tier progression system",
                        "Member-only discounts up to 30%"
                    ]
                },
                {
                    category: "User Experience",
                    icon: "📱",
                    items: [
                        "Mobile-first responsive design",
                        "Swipeable court selector",
                        "Push notifications",
                        "Email confirmations",
                        "Touch-friendly interface"
                    ]
                },
                {
                    category: "Business Features",
                    icon: "📊",
                    items: [
                        "Promotional discount codes",
                        "Revenue analytics dashboard",
                        "Member management tools",
                        "Automated billing",
                        "Performance insights"
                    ]
                }
            ]
        },
        {
            version: "1.5.0",
            date: "November 2025",
            status: "previous",
            title: "Enhanced Booking System",
            features: [
                {
                    category: "Bookings",
                    icon: "📅",
                    items: [
                        "Multi-court booking",
                        "Recurring bookings",
                        "Booking templates",
                        "Waitlist functionality"
                    ]
                },
                {
                    category: "Social Features",
                    icon: "👥",
                    items: [
                        "Find match feature",
                        "Player profiles",
                        "Match history",
                        "Friend invitations"
                    ]
                }
            ]
        },
        {
            version: "1.0.0",
            date: "October 2025",
            status: "previous",
            title: "Initial Launch",
            features: [
                {
                    category: "Core Features",
                    icon: "🎾",
                    items: [
                        "Court booking system",
                        "User authentication",
                        "Basic payment processing",
                        "Admin dashboard"
                    ]
                }
            ]
        }
    ];

    const upcomingFeatures = [
        {
            title: "Mobile App",
            description: "Native iOS and Android apps",
            status: "In Development",
            eta: "Q1 2026"
        },
        {
            title: "Tournament Management",
            description: "Organize and manage tournaments",
            status: "Planned",
            eta: "Q2 2026"
        },
        {
            title: "Equipment Rental",
            description: "Book equipment along with courts",
            status: "Planned",
            eta: "Q2 2026"
        },
        {
            title: "Coaching Integration",
            description: "Book lessons with certified coaches",
            status: "Planned",
            eta: "Q3 2026"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-6">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">What's New</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stay up to date with the latest features, improvements, and updates
                    </p>
                </div>

                {/* Version History */}
                <div className="space-y-12 mb-16">
                    {updates.map((update) => (
                        <div key={update.version} className="relative">
                            {/* Version Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`px-4 py-2 rounded-full font-bold text-sm ${update.status === 'latest'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-white/5 text-gray-400'
                                    }`}>
                                    v{update.version}
                                    {update.status === 'latest' && (
                                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">LATEST</span>
                                    )}
                                </div>
                                <span className="text-gray-500 text-sm">{update.date}</span>
                            </div>

                            {/* Update Card */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                <h2 className="text-3xl font-bold text-white mb-2">{update.title}</h2>
                                {update.description && (
                                    <p className="text-gray-400 mb-8">{update.description}</p>
                                )}

                                {/* Features by Category */}
                                <div className="space-y-8">
                                    {update.features.map((category) => (
                                        <div key={category.category}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-3xl">{category.icon}</span>
                                                <h3 className="text-xl font-bold text-white">{category.category}</h3>
                                            </div>
                                            <ul className="space-y-3 ml-12">
                                                {category.items.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-300">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Features */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-8 h-8 text-blue-400" />
                        <h2 className="text-3xl font-bold text-white">Coming Soon</h2>
                    </div>
                    <p className="text-gray-400 mb-8">
                        Here's what we're working on next. Stay tuned for these exciting features!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${feature.status === 'In Development'
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                        {feature.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>ETA: {feature.eta}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Request CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Have a feature request or suggestion?</p>
                    <a
                        href="/help/contact"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Share Your Ideas
                    </a>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">50+</div>
                        <div className="text-gray-400 text-sm">Features</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">15+</div>
                        <div className="text-gray-400 text-sm">Integrations</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                        <div className="text-gray-400 text-sm">Uptime</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">24/7</div>
                        <div className="text-gray-400 text-sm">Support</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
