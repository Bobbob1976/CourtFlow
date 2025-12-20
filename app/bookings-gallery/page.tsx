import { createClient } from "@/utils/supabase/server";
import BookingCardWithImage from "@/components/booking/BookingCardWithImage";
import Link from "next/link";

export default async function BookingsGalleryPage() {
    const supabase = createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Login Required</h1>
                    <p className="text-gray-400 mb-6">Je moet ingelogd zijn om je bookings te zien</p>
                    <Link
                        href="/login"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Inloggen
                    </Link>
                </div>
            </div>
        );
    }

    // Get bookings with images
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      booking_date,
      start_time,
      end_time,
      attendees,
      court:courts(name, sport),
      club:clubs(name)
    `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(12);

    if (error) {
        console.error('Error fetching bookings:', error);
    }

    const upcomingBookings = bookings || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Terug naar Dashboard
                    </Link>

                    <h1 className="text-5xl font-bold text-white mb-4">
                        Mijn <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Bookings</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        {upcomingBookings.length} aankomende {upcomingBookings.length === 1 ? 'booking' : 'bookings'}
                    </p>
                </div>

                {/* Bookings Grid */}
                {upcomingBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingBookings.map((booking: any) => (
                            <BookingCardWithImage key={booking.id} booking={booking} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Geen aankomende bookings</h2>
                        <p className="text-gray-400 mb-8">Boek je eerste court en begin met spelen!</p>
                        <Link
                            href="/demo"
                            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all"
                        >
                            Boek een Court
                        </Link>
                    </div>
                )}

                {/* Stats Section */}
                {upcomingBookings.length > 0 && (
                    <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Jouw Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                    {upcomingBookings.length}
                                </div>
                                <div className="text-gray-400 text-sm">Bookings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                    {upcomingBookings.reduce((acc: number, b: any) => acc + (b.attendees || 0), 0)}
                                </div>
                                <div className="text-gray-400 text-sm">Totaal Spelers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                                    {new Set(upcomingBookings.map((b: any) => b.court?.name)).size}
                                </div>
                                <div className="text-gray-400 text-sm">Courts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-2">
                                    {new Set(upcomingBookings.map((b: any) => b.club?.name)).size}
                                </div>
                                <div className="text-gray-400 text-sm">Clubs</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
