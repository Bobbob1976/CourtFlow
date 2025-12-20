import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BookingSuccessPage({
    searchParams,
    params,
}: {
    searchParams: { booking_id?: string };
    params: { clubId: string };
}) {
    const bookingId = searchParams.booking_id;

    if (!bookingId) {
        redirect(`/${params.clubId}`);
    }

    const supabase = createClient();

    // Get booking details
    const { data: booking } = await supabase
        .from("bookings")
        .select(`
      *,
      court:courts(name, sport),
      club:clubs(name)
    `)
        .eq("id", bookingId)
        .single();

    if (!booking) {
        redirect(`/${params.clubId}`);
    }

    // Update payment status to paid
    await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 mb-4 animate-in zoom-in duration-500">
                        <svg
                            className="w-12 h-12 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Betaling Gelukt!</h1>
                    <p className="text-gray-400">Je boeking is bevestigd</p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Boeking Details</h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Baan</span>
                            <span className="text-white font-bold">{booking.court.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Sport</span>
                            <span className="text-white">{booking.court.sport}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Datum</span>
                            <span className="text-white">{booking.booking_date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tijd</span>
                            <span className="text-white">
                                {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-3">
                            <span className="text-gray-400">Totaal Betaald</span>
                            <span className="text-2xl font-bold text-green-400">€{booking.total_cost}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-green-400 font-bold">Betaling Bevestigd</p>
                            <p className="text-xs text-gray-400">Je ontvangt een bevestiging per email</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-center transition-colors"
                    >
                        Naar Dashboard
                    </Link>
                    <Link
                        href={`/${params.clubId}`}
                        className="block w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold text-center transition-colors border border-white/10"
                    >
                        Nieuwe Boeking
                    </Link>
                </div>

                {/* Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Booking ID: {bookingId.slice(0, 8)}...
                    </p>
                </div>
            </div>
        </div>
    );
}
