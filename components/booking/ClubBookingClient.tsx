"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SmartBookingTimeline from "./SmartBookingTimeline";
import BookingModal from "./BookingModal";

interface ClubBookingClientProps {
    clubId: string;
    userId: string;
}

export default function ClubBookingClient({ clubId, userId }: ClubBookingClientProps) {
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date; courtId: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(0);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("booking") === "success") {
            alert("Boeking succesvol!");
            setIsModalOpen(false);
            setSelectedSlot(null);
            setLastUpdate(Date.now()); // Force timeline refresh
            router.refresh();
            // Clear the param to prevent showing it again on refresh
            router.replace(`/${clubId}`);
        }
    }, [searchParams, clubId, router]);

    const handleSlotSelect = (date: Date, courtId: string) => {
        setSelectedSlot({ date, courtId });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white/5 rounded-3xl shadow-2xl shadow-black/20 p-6 border border-white/10 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></span>
                    Kies een tijdstip
                </h2>
                <SmartBookingTimeline
                    clubId={clubId}
                    onSlotSelect={handleSlotSelect}
                    lastUpdate={lastUpdate}
                />
            </div>

            {selectedSlot && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedSlot.date}
                    courtId={selectedSlot.courtId}
                    clubId={clubId}
                    userId={userId}
                    price={37.50} // TODO: Fetch real price from court
                />
            )}
        </div>
    );
}
