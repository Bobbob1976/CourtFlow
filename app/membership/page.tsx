import { createClient } from "@/utils/supabase/server";
import { Check, Star, Crown, Zap } from "lucide-react";

export default async function MembershipPage() {
    const supabase = createClient();

    // Get membership tiers
    const { data: tiers } = await supabase
        .from("membership_tiers")
        .select("*")
        .eq("club_id", "90f93d47-b438-427c-8b33-0597817c1d96")
        .eq("is_active", true)
        .order("display_order");

    // Get user's current membership
    const { data: { user } } = await supabase.auth.getUser();
    let currentMembership = null;

    if (user) {
        const { data } = await supabase
            .from("user_memberships")
            .select("*, tier:membership_tiers(*)")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();
        currentMembership = data;
    }

    const getIcon = (index: number) => {
        switch (index) {
            case 0: return <Star className="w-8 h-8" />;
            case 1: return <Zap className="w-8 h-8" />;
            case 2: return <Crown className="w-8 h-8" />;
            default: return <Star className="w-8 h-8" />;
        }
    };

    const getGradient = (index: number) => {
        switch (index) {
            case 0: return "from-blue-600 to-cyan-600";
            case 1: return "from-purple-600 to-pink-600";
            case 2: return "from-yellow-600 to-orange-600";
            default: return "from-gray-600 to-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
                        Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Membership</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Unlock exclusive benefits, save money, and play more with our membership plans
                    </p>
                </div>

                {/* Current Membership Banner */}
                {currentMembership && (
                    <div className="mb-12 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-400 font-bold text-sm mb-1">ACTIVE MEMBERSHIP</p>
                                <h3 className="text-2xl font-bold text-white">{currentMembership.tier.name}</h3>
                                <p className="text-gray-400 text-sm">
                                    Next billing: {currentMembership.next_billing_date}
                                </p>
                            </div>
                            <a
                                href="/membership/manage"
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all"
                            >
                                Manage
                            </a>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers?.map((tier, index) => {
                        const benefits = Array.isArray(tier.benefits) ? tier.benefits : [];
                        const isCurrentPlan = currentMembership?.tier_id === tier.id;
                        const isPremium = index === 1; // Middle tier is featured

                        return (
                            <div
                                key={tier.id}
                                className={`relative rounded-3xl overflow-hidden transition-all hover:scale-105 ${isPremium ? "md:-mt-8 md:mb-8" : ""
                                    }`}
                            >
                                {/* Popular Badge */}
                                {isPremium && (
                                    <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                                        MOST POPULAR
                                    </div>
                                )}

                                {/* Card */}
                                <div className={`relative bg-gradient-to-br ${getGradient(index)} p-[2px] h-full`}>
                                    <div className="bg-slate-900 rounded-3xl p-8 h-full flex flex-col">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white mb-6`}>
                                            {getIcon(index)}
                                        </div>

                                        {/* Tier Name */}
                                        <h3 className="text-3xl font-bold text-white mb-2">{tier.name}</h3>
                                        <p className="text-gray-400 mb-6">{tier.description}</p>

                                        {/* Pricing */}
                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-bold text-white">€{tier.price_monthly}</span>
                                                <span className="text-gray-400">/month</span>
                                            </div>
                                            {tier.price_yearly && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    or €{tier.price_yearly}/year (save €{((tier.price_monthly * 12) - tier.price_yearly).toFixed(2)})
                                                </p>
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        <div className="flex-1 space-y-3 mb-8">
                                            {benefits.map((benefit: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-300 text-sm">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        {isCurrentPlan ? (
                                            <button
                                                disabled
                                                className="w-full bg-white/10 text-white py-4 rounded-xl font-bold cursor-not-allowed"
                                            >
                                                Current Plan
                                            </button>
                                        ) : (
                                            <a
                                                href={`/membership/subscribe?tier=${tier.id}`}
                                                className={`w-full bg-gradient-to-r ${getGradient(index)} hover:opacity-90 text-white py-4 rounded-xl font-bold text-center transition-all block`}
                                            >
                                                {currentMembership ? "Upgrade" : "Get Started"}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Can I cancel anytime?</h3>
                            <p className="text-gray-400">
                                Yes! You can cancel your membership at any time. You'll continue to have access until the end of your billing period.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-2">What payment methods do you accept?</h3>
                            <p className="text-gray-400">
                                We accept all major credit cards, iDEAL, and other payment methods via Mollie.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Can I upgrade or downgrade my plan?</h3>
                            <p className="text-gray-400">
                                Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
