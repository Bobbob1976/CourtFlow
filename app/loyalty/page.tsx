import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Star, Gift, TrendingUp, Award } from "lucide-react";

export default async function LoyaltyPage() {
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const clubId = "90f93d47-b438-427c-8b33-0597817c1d96";

    // Get user's points
    const { data: loyaltyData } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .eq("club_id", clubId)
        .single();

    // Get recent transactions
    const { data: transactions } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })
        .limit(10);

    // Get available rewards
    const { data: rewards } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("club_id", clubId)
        .eq("is_active", true)
        .order("display_order");

    const balance = loyaltyData?.balance || 0;
    const tier = loyaltyData?.tier || "bronze";
    const lifetimeEarned = loyaltyData?.lifetime_earned || 0;

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "platinum": return "from-purple-400 to-pink-400";
            case "gold": return "from-yellow-400 to-orange-400";
            case "silver": return "from-gray-300 to-gray-400";
            default: return "from-orange-600 to-red-600";
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "platinum": return "💎";
            case "gold": return "🏆";
            case "silver": return "🥈";
            default: return "🥉";
        }
    };

    const getNextTier = (currentTier: string) => {
        switch (currentTier) {
            case "bronze": return { name: "Silver", points: 2000 };
            case "silver": return { name: "Gold", points: 5000 };
            case "gold": return { name: "Platinum", points: 10000 };
            default: return null;
        }
    };

    const nextTier = getNextTier(tier);
    const progressToNext = nextTier ? (lifetimeEarned / nextTier.points) * 100 : 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Loyalty Rewards</h1>
                    <p className="text-gray-400">Earn points, unlock rewards, and level up!</p>
                </div>

                {/* Points Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-blue-100 font-medium mb-2">Available Points</p>
                            <div className="flex items-baseline gap-3 mb-6">
                                <h2 className="text-6xl font-bold text-white">{balance}</h2>
                                <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-blue-100 text-sm">Lifetime Earned</p>
                                    <p className="text-white font-bold text-xl">{lifetimeEarned}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">Lifetime Spent</p>
                                    <p className="text-white font-bold text-xl">{loyaltyData?.lifetime_spent || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                    </div>

                    {/* Tier Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <div className="text-center">
                            <div className="text-6xl mb-4">{getTierIcon(tier)}</div>
                            <h3 className={`text-3xl font-bold bg-gradient-to-r ${getTierColor(tier)} bg-clip-text text-transparent mb-2`}>
                                {tier.toUpperCase()}
                            </h3>
                            {nextTier && (
                                <>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {nextTier.points - lifetimeEarned} points to {nextTier.name}
                                    </p>
                                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                        <div
                                            className={`h-2 rounded-full bg-gradient-to-r ${getTierColor(tier)}`}
                                            style={{ width: `${Math.min(progressToNext, 100)}%` }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rewards Catalog */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Redeem Rewards</h2>
                        <Gift className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards?.map((reward) => {
                            const canAfford = balance >= reward.points_cost;
                            return (
                                <div
                                    key={reward.id}
                                    className={`bg-white/5 border rounded-2xl p-6 transition-all ${canAfford
                                            ? "border-purple-500/30 hover:border-purple-500 hover:scale-105"
                                            : "border-white/10 opacity-60"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl">🎁</div>
                                        <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                                            <Star className="w-4 h-4 text-purple-400" />
                                            <span className="text-purple-400 font-bold text-sm">{reward.points_cost}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6">{reward.description}</p>

                                    <button
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-xl font-bold transition-all ${canAfford
                                                ? "bg-purple-600 hover:bg-purple-500 text-white"
                                                : "bg-white/10 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {canAfford ? "Redeem" : "Not Enough Points"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Activity</th>
                                    <th className="px-6 py-4 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions?.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{tx.type}</div>
                                            {tx.description && (
                                                <div className="text-gray-500 text-xs">{tx.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${tx.points > 0 ? "text-green-400" : "text-red-400"}`}>
                                                {tx.points > 0 ? "+" : ""}{tx.points}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!transactions || transactions.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            No activity yet. Start booking to earn points!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* How to Earn */}
                <div className="mt-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">How to Earn Points</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Book Courts</h4>
                                <p className="text-gray-400 text-sm">Earn 10 points per €1 spent</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Refer Friends</h4>
                                <p className="text-gray-400 text-sm">Get 500 points per referral</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Star className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Leave Reviews</h4>
                                <p className="text-gray-400 text-sm">Earn 50 points per review</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
