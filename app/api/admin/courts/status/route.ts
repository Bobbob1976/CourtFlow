import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json({ error: 'Club ID required' }, { status: 400 });
        }

        const supabase = createClient();
        const now = new Date();

        // Get all courts for the club
        const { data: courts, error: courtsError } = await supabase
            .from('courts')
            .select('*')
            .eq('club_id', clubId)
            .order('name');

        if (courtsError) {
            throw courtsError;
        }

        // Get current bookings
        const { data: bookings } = await supabase
            .from('bookings')
            .select(`
        *,
        user:user_profiles(full_name)
      `)
            .eq('club_id', clubId)
            .eq('booking_date', now.toISOString().split('T')[0])
            .is('cancelled_at', null);

        // Get maintenance records
        const { data: maintenance } = await supabase
            .from('court_maintenance')
            .select('*')
            .lte('start_time', now.toISOString())
            .or(`end_time.is.null,end_time.gte.${now.toISOString()}`);

        // Build court status
        const courtStatus = courts?.map(court => {
            // Check if in maintenance
            const maintenanceRecord = maintenance?.find(m => m.court_id === court.id);
            if (maintenanceRecord) {
                return {
                    id: court.id,
                    name: court.name,
                    status: 'maintenance',
                    maintenanceInfo: {
                        reason: maintenanceRecord.notes || 'Onderhoud',
                        estimatedEnd: maintenanceRecord.end_time
                            ? new Date(maintenanceRecord.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
                            : 'Onbekend'
                    }
                };
            }

            // Check if currently occupied
            const currentBooking = bookings?.find(b => {
                if (b.court_id !== court.id) return false;

                const bookingStart = new Date(`${b.booking_date}T${b.start_time}`);
                const bookingEnd = new Date(`${b.booking_date}T${b.end_time}`);

                return now >= bookingStart && now <= bookingEnd;
            });

            if (currentBooking) {
                const endTime = new Date(`${currentBooking.booking_date}T${currentBooking.end_time}`);
                const remainingMs = endTime.getTime() - now.getTime();
                const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));

                return {
                    id: court.id,
                    name: court.name,
                    status: currentBooking.payment_status === 'pending' ? 'payment_pending' : 'occupied',
                    currentBooking: {
                        id: currentBooking.id,
                        startTime: currentBooking.start_time.slice(0, 5),
                        endTime: currentBooking.end_time.slice(0, 5),
                        remainingMinutes: remainingMinutes,
                        players: [
                            { name: currentBooking.user?.full_name || 'Speler 1' },
                            ...Array(currentBooking.attendees - 1).fill(null).map((_, i) => ({
                                name: `Speler ${i + 2}`
                            }))
                        ],
                        paymentStatus: currentBooking.payment_status
                    }
                };
            }

            // Available
            return {
                id: court.id,
                name: court.name,
                status: 'available'
            };
        }) || [];

        return NextResponse.json({
            courts: courtStatus,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Court status API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch court status' },
            { status: 500 }
        );
    }
}
