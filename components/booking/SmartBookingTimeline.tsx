"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { format, addDays, startOfDay, addHours, isSameHour } from "date-fns";
import { nl } from "date-fns/locale";
import BookingSlot from "./BookingSlot";

interface SmartBookingTimelineProps {
    clubId: string;
    sport?: "padel" | "tennis" | "squash";
    onSlotSelect: (date: Date, courtId: string) => void;
}

interface TimeSlot {
    time: Date;
    available: boolean;
    courtId?: string;
    price?: number;
    courtType?: 'single' | 'double';
}

export default function SmartBookingTimeline({
    clubId,
    sport = "padel",
    onSlotSelect,
    lastUpdate = 0,
}: SmartBookingTimelineProps & { lastUpdate?: number }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

    useEffect(() => {
        async function fetchAvailability() {
            setLoading(true);
            const start = startOfDay(selectedDate);
            const end = addDays(start, 1);

            // 1. Get courts for this sport
            // console.log("Fetching courts for Club ID:", clubId);

            const { data: courts, error: courtError } = await supabase
                .from("courts")
                .select("id, hourly_rate, sport, is_active, max_players")
                .eq("club_id", clubId);

            if (courtError) {
                console.error("Error fetching courts:", courtError.message);
            }

            if (!courts || courts.length === 0) {
                // console.warn("No courts found for this club!");
                setSlots([]);
                setLoading(false);
                return;
            }

            // 2. Get bookings for these courts
            const { data: bookings, error: bookingsError } = await supabase
                .from("bookings")
                .select("court_id, start_time, end_time")
                .in("court_id", courts.map((c) => c.id))
                .eq("booking_date", format(selectedDate, "yyyy-MM-dd"))
                .neq("status", "cancelled");

            if (bookingsError) {
                console.error("Error fetching bookings:", bookingsError.message);
            }

            // 3. Generate slots (08:00 - 23:00)
            const generatedSlots: TimeSlot[] = [];
            for (let hour = 8; hour < 23; hour++) {
                const time = addHours(start, hour);

                // Find a court that is NOT booked at this time
                const availableCourt = courts.find((court) => {
                    const isBooked = bookings?.some((b) => {
                        const bookingStart = parseInt(b.start_time.split(":")[0]);
                        const bookingEnd = parseInt(b.end_time.split(":")[0]);
                        return b.court_id === court.id && hour >= bookingStart && hour < bookingEnd;
                    });
                    return !isBooked;
                });

                generatedSlots.push({
                    time,
                    available: !!availableCourt,
                    courtId: availableCourt?.id,
                    price: availableCourt?.hourly_rate,
                    courtType: availableCourt?.max_players === 2 ? 'single' : 'double',
                });
            }

            setSlots(generatedSlots);
            setLoading(false);
        }

        fetchAvailability();
    }, [selectedDate, clubId, sport, lastUpdate]);

    return (
        <div className="w-full space-y-6">
            {/* Date Selector */}
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
                {dates.map((date) => {
                    const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all duration-300 border ${isSelected
                                ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110 z-10"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 border-white/5 hover:border-white/20 hover:scale-105"
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">{format(date, "EEE", { locale: nl })}</span>
                            <span className="text-xl font-extrabold">{format(date, "d")}</span>
                        </button>
                    );
                })}
            </div>

            {/* Timeline */}
            <div className="relative min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 shadow-[0_0_20px_#3b82f6]"></div>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <p className="text-gray-400 font-medium">Geen banen beschikbaar</p>
                        <p className="text-xs text-gray-600 mt-1">Probeer een andere datum</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {slots.map((slot) => (
                            <BookingSlot
                                key={slot.time.toISOString()}
                                time={format(slot.time, "HH:mm")}
                                price={slot.price || 37.50}
                                courtType={slot.courtType || 'double'}
                                isAvailable={slot.available}
                                onClick={() => slot.available && onSlotSelect(slot.time, slot.courtId!)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
