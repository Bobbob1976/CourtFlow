import { Check, Zap, Shield, TrendingUp, Users, CreditCard, Gift, Bell, BarChart, Cloud } from "lucide-react";

export default function FeaturesPage() {
    const featureCategories = [
        {
            title: "Smart Booking",
            icon: Zap,
            color: "from-blue-600 to-cyan-600",
            features: [
                { name: "Real-time availability", description: "See court status instantly" },
                { name: "Quick booking", description: "Book in under 30 seconds" },
                { name: "Recurring bookings", description: "Set up weekly sessions" },
                { name: "Multi-court booking", description: "Book multiple courts at once" },
                { name: "Waitlist", description: "Get notified when courts become available" },
                { name: "Booking templates", description: "Save your favorite time slots" },
            ]
        },
        {
            title: "AI Intelligence",
            icon: Cloud,
            color: "from-purple-600 to-pink-600",
            features: [
                { name: "Occupancy forecasting", description: "85-95% prediction accuracy" },
                { name: "Weather integration", description: "Real-time weather impact analysis" },
                { name: "Demand predictions", description: "Know the best times to book" },
                { name: "Smart recommendations", description: "Personalized court suggestions" },
                { name: "Historical analytics", description: "Track usage patterns" },
                { name: "Automated insights", description: "Data-driven decisions" },
            ]
        },
        {
            title: "Payments",
            icon: CreditCard,
            color: "from-green-600 to-emerald-600",
            features: [
                { name: "Mollie integration", description: "Secure payment processing" },
                { name: "Digital wallet", description: "Top up and pay instantly" },
                { name: "Split payments", description: "Share costs with friends" },
                { name: "Instant refunds", description: "Automatic refund processing" },
                { name: "Multiple methods", description: "iDEAL, credit card, and more" },
                { name: "Auto-invoicing", description: "Automatic receipt generation" },
            ]
        },
        {
            title: "Memberships",
            icon: Users,
            color: "from-yellow-600 to-orange-600",
            features: [
                { name: "3 membership tiers", description: "Basic, Premium, and VIP" },
                { name: "Exclusive discounts", description: "Up to 30% off bookings" },
                { name: "Priority booking", description: "Book up to 48h in advance" },
                { name: "Member benefits", description: "Free courts, lockers, and more" },
                { name: "Flexible billing", description: "Monthly or yearly plans" },
                { name: "Easy upgrades", description: "Change plans anytime" },
            ]
        },
        {
            title: "Loyalty & Rewards",
            icon: Gift,
            color: "from-red-600 to-pink-600",
            features: [
                { name: "Points on bookings", description: "10 points per €1 spent" },
                { name: "Tier progression", description: "Bronze to Platinum levels" },
                { name: "Rewards catalog", description: "Discounts, free courts, merch" },
                { name: "Referral bonuses", description: "500 points per friend" },
                { name: "Birthday rewards", description: "Special birthday perks" },
                { name: "Review rewards", description: "Earn points for feedback" },
            ]
        },
        {
            title: "Promotions",
            icon: TrendingUp,
            color: "from-indigo-600 to-purple-600",
            features: [
                { name: "Discount codes", description: "Seasonal and special offers" },
                { name: "Time-based deals", description: "Early bird and off-peak discounts" },
                { name: "First-time bonuses", description: "Welcome offers for new users" },
                { name: "Flash sales", description: "Limited-time promotions" },
                { name: "Weekend specials", description: "Weekend-only discounts" },
                { name: "Group discounts", description: "Save when booking for groups" },
            ]
        },
        {
            title: "Notifications",
            icon: Bell,
            color: "from-cyan-600 to-blue-600",
            features: [
                { name: "Booking confirmations", description: "Instant email confirmations" },
                { name: "Reminders", description: "Get reminded before your booking" },
                { name: "Push notifications", description: "Real-time app notifications" },
                { name: "Payment alerts", description: "Transaction notifications" },
                { name: "Promotion alerts", description: "Never miss a deal" },
                { name: "Status updates", description: "Court availability changes" },
            ]
        },
        {
            title: "Analytics",
            icon: BarChart,
            color: "from-violet-600 to-purple-600",
            features: [
                { name: "Booking history", description: "Track all your bookings" },
                { name: "Spending insights", description: "See where your money goes" },
                { name: "Usage statistics", description: "Your playing patterns" },
                { name: "Points tracking", description: "Monitor loyalty progress" },
                { name: "Performance metrics", description: "Personal achievements" },
                { name: "Export data", description: "Download your data anytime" },
            ]
        },
        {
            title: "Security",
            icon: Shield,
            color: "from-gray-600 to-slate-600",
            features: [
                { name: "Secure authentication", description: "Supabase Auth integration" },
                { name: "Data encryption", description: "End-to-end encryption" },
                { name: "PCI compliance", description: "Secure payment processing" },
                { name: "Privacy controls", description: "Control your data" },
                { name: "Two-factor auth", description: "Extra account security" },
                { name: "GDPR compliant", description: "European data protection" },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
                        All <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Discover everything CourtFlow has to offer. From smart booking to AI-powered insights, we've got you covered.
                    </p>
                </div>

                {/* Feature Categories */}
                <div className="space-y-16">
                    {featureCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.title} className="relative">
                                {/* Category Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-bold text-white">{category.title}</h2>
                                </div>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.features.map((feature) => (
                                        <div
                                            key={feature.name}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors">
                                                        {feature.name}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">{feature.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <div className="mt-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">By the Numbers</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                50+
                            </div>
                            <div className="text-gray-400">Features</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                15+
                            </div>
                            <div className="text-gray-400">Integrations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                                99.9%
                            </div>
                            <div className="text-gray-400">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                                24/7
                            </div>
                            <div className="text-gray-400">Support</div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-6">Ready to experience all these features?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/membership"
                            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all"
                        >
                            Get Started
                        </a>
                        <a
                            href="/help"
                            className="inline-block bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/10"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
