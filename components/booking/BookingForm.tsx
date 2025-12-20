"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createAtomicBooking } from "../../app/(club)/[clubId]/actions";

interface BookingFormProps {
    clubId: string;
    courtId: string;
    userId: string;
    hourlyRate: number;
    capacity: number;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
            {pending ? "Bezig met boeken..." : "Boek baan"}
        </button>
    );
}

export default function BookingForm({
    clubId,
    courtId,
    userId,
    hourlyRate,
    capacity,
}: BookingFormProps) {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(`1970-01-01T${startTime}`);
            const end = new Date(`1970-01-01T${endTime}`);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

            if (diff > 0) {
                setDuration(diff);
                setTotalPrice(diff * hourlyRate);
            } else {
                setDuration(0);
                setTotalPrice(0);
            }
        }
    }, [startTime, endTime, hourlyRate]);

    return (
        <form action={createAtomicBooking} className="mt-6 space-y-4">
            <input type="hidden" name="clubId" value={clubId} />
            <input type="hidden" name="courtId" value={courtId} />
            <input type="hidden" name="userId" value={userId} />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                    type="date"
                    name="bookingDate"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Van</label>
                    <input
                        type="time"
                        name="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tot</label>
                    <input
                        type="time"
                        name="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            {duration > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-blue-800">Duur: {duration} uur</span>
                    <span className="font-bold text-blue-900">Totaal: €{totalPrice.toFixed(2)}</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aantal Spelers</label>
                <input
                    type="number"
                    name="attendees"
                    min="1"
                    max={capacity}
                    defaultValue={4}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
