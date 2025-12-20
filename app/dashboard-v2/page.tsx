import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MobileBookingCard from "@/components/booking/MobileBookingCard";
import { Calendar, TrendingUp, Clock, Award } from "lucide-react";

export default async function ImprovedDashboardPage() {
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Get upcoming bookings
    const { data: upcomingBookings } = await supabase
        .from("bookings")
        .select(`
      *,
      court:courts(name, sport)
    `)
        .eq("user_id", user.id)
        .gte("booking_date", new Date().toISOString().split("T")[0])
        .is("cancelled_at", null)
        .order("booking_date", { ascending: true })
        .limit(10);

    // Get stats
    const { data: allBookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .is("cancelled_at", null);

    const totalBookings = allBookings?.length || 0;
    const totalSpent = allBookings?.reduce((sum, b) => sum + b.total_cost, 0) || 0;
    const upcomingCount = upcomingBookings?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Mobile-Optimized Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                Welcome back, {profile?.full_name?.split(" ")[0] || "Player"}! 👋
                            </h1>
                            <p className="text-blue-100">Ready to play?</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-3xl">
                            {profile?.full_name?.[0] || "?"}
                        </div>
                    </div>

                    {/* Quick Stats - Mobile Optimized */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-white" />
                                <p className="text-white/80 text-xs font-medium">Upcoming</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{upcomingCount}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-white" />
                                <p className="text-white/80 text-xs font-medium">Total</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{totalBookings}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-white" />
                                <p className="text-white/80 text-xs font-medium">Hours</p>
                            </div>
                            <p className="text-3xl font-bold text-white">{Math.round(totalBookings * 1.5)}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-white" />
                                <p className="text-white/80 text-xs font-medium">Spent</p>
                            </div>
                            <p className="text-2xl font-bold text-white">€{totalSpent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
                {/* Upcoming Bookings */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Upcoming Bookings</h2>
                        <a
                            href="/book"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                        >
                            + New Booking
                        </a>
                    </div>

                    {upcomingBookings && upcomingBookings.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {upcomingBookings.map((booking) => (
                                <MobileBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onCancel={(id) => console.log("Cancel:", id)}
                                    onExtend={(id) => console.log("Extend:", id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                            <div className="text-6xl mb-4">🎾</div>
                            <h3 className="text-xl font-bold text-white mb-2">No upcoming bookings</h3>
                            <p className="text-gray-400 mb-6">Book a court and start playing!</p>
                            <a
                                href="/book"
                                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
                            >
                                Book Now
                            </a>
                        </div>
                    )}
                </div>

                {/* Quick Actions - Mobile Optimized */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/matches"
                        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform active:scale-95"
                    >
                        <div className="text-4xl mb-3">🏆</div>
                        <h3 className="text-white font-bold mb-1">Find Match</h3>
                        <p className="text-gray-400 text-sm">Play with others</p>
                    </a>

                    <a
                        href="/wallet"
                        className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform active:scale-95"
                    >
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="text-white font-bold mb-1">Wallet</h3>
                        <p className="text-gray-400 text-sm">Top up balance</p>
                    </a>

                    <a
                        href="/profile"
                        className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform active:scale-95"
                    >
                        <div className="text-4xl mb-3">⚙️</div>
                        <h3 className="text-white font-bold mb-1">Settings</h3>
                        <p className="text-gray-400 text-sm">Manage account</p>
                    </a>

                    <a
                        href="/history"
                        className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-transform active:scale-95"
                    >
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-white font-bold mb-1">History</h3>
                        <p className="text-gray-400 text-sm">Past bookings</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
