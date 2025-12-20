"use client";

import { useState } from "react";
import { createBookingRefund } from "@/lib/refund-actions";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        id: string;
        court?: { name: string };
        booking_date: string;
        total_cost: number;
    };
    onSuccess: () => void;
}

export default function RefundModal({ isOpen, onClose, booking, onSuccess }: RefundModalProps) {
    const [reason, setReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleRefund = async () => {
        setIsProcessing(true);
        setError("");

        try {
            const result = await createBookingRefund(booking.id, reason);

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.error || "Refund failed");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-white/20 rounded-3xl p-6 max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Process Refund</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Booking Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Court</span>
                            <span className="text-white font-bold">{booking.court?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Date</span>
                            <span className="text-white">{booking.booking_date}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="text-gray-400">Refund Amount</span>
                            <span className="text-2xl font-bold text-green-400">€{booking.total_cost}</span>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-2">
                        Reason for Refund
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason (optional)..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        rows={3}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Warning */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>Warning:</strong> This action cannot be undone. The refund will be processed immediately via Mollie.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRefund}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? "Processing..." : "Confirm Refund"}
                    </button>
                </div>
            </div>
        </div>
    );
}
