import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BookingCard from "@/components/booking/BookingCard";

export default async function BookingsPage({
    searchParams,
}: {
    searchParams: { newBooking?: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch bookings with joined court and club data
    const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
            *,
            court:courts (
                name,
                sport
            ),
            club:clubs (
                id,
                name,
                subdomain
            )
        `)
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error);
        return <div>Er is een fout opgetreden bij het laden van je boekingen.</div>;
    }

    const upcomingBookings = bookings?.filter(b => {
        if (b.cancelled_at) return false; // Exclude cancelled bookings
        const endDateTime = new Date(`${b.booking_date}T${b.end_time}`);
        return endDateTime >= new Date();
    }) || [];

    const pastBookings = bookings?.filter(b => {
        if (b.cancelled_at) return false; // Exclude cancelled bookings
        const endDateTime = new Date(`${b.booking_date}T${b.end_time}`);
        return endDateTime < new Date();
    }) || [];

    return (
        <div className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {searchParams.newBooking && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-md" role="alert">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                            <strong className="font-bold">Boeking geslaagd!</strong>
                            <span className="block sm:inline"> Je baan is gereserveerd.</span>
                        </div>
                    </div>
                )}

                <div>
                    <h1 className="text-3xl font-bold text-white">Mijn Boekingen</h1>
                    <p className="mt-2 text-gray-400">Beheer je geplande en afgelopen sessies.</p>
                </div>

                {/* Upcoming */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-4">Aankomend</h2>
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
                            <p className="text-gray-400 mb-4">Je hebt geen aankomende boekingen.</p>
                            <a href="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                Boek een baan
                            </a>
                        </div>
                    )}
                </section>

                {/* Past */}
                {pastBookings.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Geschiedenis</h2>
                        <div className="space-y-4">
                            {pastBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
