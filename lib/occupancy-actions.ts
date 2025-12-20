"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Update occupancy history after a booking is created/cancelled
 * This keeps the historical data fresh for accurate forecasting
 */
export async function updateOccupancyHistory(bookingId: string) {
    try {
        const supabase = createClient();

        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            console.error('Failed to fetch booking:', bookingError);
            return { success: false, error: 'Booking not found' };
        }

        // Extract hour from start_time
        const hour = parseInt(booking.start_time.split(':')[0]);
        const dayOfWeek = new Date(booking.booking_date).getDay();

        // Check if booking is cancelled
        const isCancelled = booking.cancelled_at !== null;

        // Get current occupancy data for this slot
        const { data: existingHistory } = await supabase
            .from('court_occupancy_history')
            .select('*')
            .eq('club_id', booking.club_id)
            .eq('court_id', booking.court_id)
            .eq('date', booking.booking_date)
            .eq('hour', hour)
            .single();

        if (existingHistory) {
            // Update existing record
            const newBookingCount = isCancelled
                ? Math.max(0, existingHistory.total_bookings - 1)
                : existingHistory.total_bookings + 1;

            const newRevenue = isCancelled
                ? Math.max(0, existingHistory.total_revenue - booking.total_cost)
                : existingHistory.total_revenue + booking.total_cost;

            await supabase
                .from('court_occupancy_history')
                .update({
                    total_bookings: newBookingCount,
                    total_revenue: newRevenue,
                    occupancy_rate: newBookingCount > 0 ? 100 : 0
                })
                .eq('id', existingHistory.id);

        } else if (!isCancelled) {
            // Create new record (only if not cancelled)
            await supabase
                .from('court_occupancy_history')
                .insert({
                    club_id: booking.club_id,
                    court_id: booking.court_id,
                    date: booking.booking_date,
                    hour: hour,
                    day_of_week: dayOfWeek,
                    occupancy_rate: 100,
                    total_bookings: 1,
                    total_revenue: booking.total_cost
                });
        }

        console.log('✅ Updated occupancy history for booking:', bookingId);
        return { success: true };

    } catch (error) {
        console.error('Failed to update occupancy history:', error);
        return { success: false, error: 'Failed to update history' };
    }
}

/**
 * Backfill occupancy history from existing bookings
 * Run this once to populate historical data
 */
export async function backfillOccupancyHistory(clubId: string, days: number = 90) {
    try {
        const supabase = createClient();

        // Get all bookings from the last X days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('club_id', clubId)
            .gte('booking_date', startDate.toISOString().split('T')[0])
            .is('cancelled_at', null);

        if (error) {
            console.error('Failed to fetch bookings:', error);
            return { success: false, error: 'Failed to fetch bookings' };
        }

        console.log(`📊 Backfilling ${bookings?.length || 0} bookings...`);

        // Group bookings by date/hour/court
        const grouped = new Map<string, any>();

        bookings?.forEach(booking => {
            const hour = parseInt(booking.start_time.split(':')[0]);
            const key = `${booking.court_id}-${booking.booking_date}-${hour}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    club_id: booking.club_id,
                    court_id: booking.court_id,
                    date: booking.booking_date,
                    hour: hour,
                    day_of_week: new Date(booking.booking_date).getDay(),
                    total_bookings: 0,
                    total_revenue: 0
                });
            }

            const group = grouped.get(key);
            group.total_bookings += 1;
            group.total_revenue += booking.total_cost;
        });

        // Insert/update all records
        const records = Array.from(grouped.values()).map(record => ({
            ...record,
            occupancy_rate: record.total_bookings > 0 ? 100 : 0
        }));

        const { error: insertError } = await supabase
            .from('court_occupancy_history')
            .upsert(records, {
                onConflict: 'club_id,court_id,date,hour'
            });

        if (insertError) {
            console.error('Failed to insert history:', insertError);
            return { success: false, error: 'Failed to insert history' };
        }

        console.log(`✅ Backfilled ${records.length} occupancy records`);
        return { success: true, count: records.length };

    } catch (error) {
        console.error('Backfill failed:', error);
        return { success: false, error: 'Backfill failed' };
    }
}
