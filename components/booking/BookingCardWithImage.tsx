"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface BookingCardProps {
    booking: {
        id: string;
        booking_date: string;
        start_time: string;
        end_time: string;
        court: {
            name: string;
            sport: string;
        };
        club: {
            name: string;
        };
        attendees: number;
    };
}

// Array met alle padel actie afbeeldingen
const padelImages = [
    '/images/padel/padel_action_red.png',
    '/images/padel/padel_action_blue.png',
    '/images/padel/padel_action_orange.png',
    '/images/padel/padel_serve_action.png',
    '/images/padel/padel_volley_purple.png',
    '/images/padel/padel_doubles_green.png',
    '/images/padel/padel_smash_yellow.png',
    '/images/padel/padel_celebration_cyan.png',
    '/images/padel/padel_backhand_pink.png',
];

// Functie om een consistente afbeelding te kiezen op basis van booking ID
function getImageForBooking(bookingId: string): string {
    const hash = bookingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return padelImages[hash % padelImages.length];
}

export default function BookingCardWithImage({ booking }: BookingCardProps) {
    const bookingImage = getImageForBooking(booking.id);

    // Format date
    const date = new Date(booking.booking_date);
    const formattedDate = date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <Link
            href={`/bookings/${booking.id}`}
            className="group block"
        >
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20">
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={bookingImage}
                        alt="Padel spelers in actie"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                    {/* Sport Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase">
                            {booking.court.sport}
                        </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-4 right-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center">
                            <div className="text-xs text-gray-300 font-medium">
                                {date.toLocaleDateString('nl-NL', { month: 'short' }).toUpperCase()}
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {date.getDate()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                        {formattedDate}
                    </h3>

                    {/* Details Grid */}
                    <div className="space-y-3">
                        {/* Time */}
                        <div className="flex items-center gap-3 text-gray-300">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-sm">
                                {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </span>
                        </div>

                        {/* Court */}
                        <div className="flex items-center gap-3 text-gray-300">
                            <MapPin className="w-5 h-5 text-green-400" />
                            <span className="text-sm">{booking.court.name}</span>
                        </div>

                        {/* Club */}
                        <div className="flex items-center gap-3 text-gray-300">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span className="text-sm">{booking.club.name}</span>
                        </div>

                        {/* Attendees */}
                        <div className="flex items-center gap-3 text-gray-300">
                            <Users className="w-5 h-5 text-orange-400" />
                            <span className="text-sm">{booking.attendees} spelers</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Bekijk details</span>
                            <svg
                                className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
