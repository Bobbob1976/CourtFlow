'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CleanDashboard() {
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('bookings')
                    .select('*, court:courts(name), club:clubs(name)')
                    .eq('user_id', user.id)
                    .order('booking_date', { ascending: false })
                    .limit(10);

                const now = new Date();
                const upcoming = data?.filter(b => new Date(b.booking_date) >= now && !b.cancelled_at).length || 0;
                const completed = data?.filter(b => new Date(b.booking_date) < now && !b.cancelled_at).length || 0;

                setStats({ upcoming, completed, total: data?.length || 0 });
                setBookings(data || []);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-sm text-gray-500">Laden...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overzicht van je reserveringen</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{stats.upcoming}</div>
                        <div className="text-sm text-gray-600">Aankomend</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{stats.completed}</div>
                        <div className="text-sm text-gray-600">Afgelopen</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</div>
                        <div className="text-sm text-gray-600">Totaal</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-8">
                    <Link
                        href="/demo-club"
                        className="inline-block px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                    >
                        Nieuwe Reservering
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tijd</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locatie</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prijs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {new Date(booking.booking_date).toLocaleDateString('nl-NL')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{booking.start_time}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.club?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.court?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">€{booking.total_price?.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${booking.cancelled_at
                                                ? 'bg-red-100 text-red-700'
                                                : new Date(booking.booking_date) >= new Date()
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {booking.cancelled_at ? 'Geannuleerd' : new Date(booking.booking_date) >= new Date() ? 'Aankomend' : 'Afgelopen'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        Nog geen reserveringen
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
