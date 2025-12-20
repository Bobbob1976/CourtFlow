"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

interface WalletPaymentOptionProps {
  bookingId: string;
  clubId: string;
  totalPrice: number;
}

export default function WalletPaymentOption({
  bookingId,
  clubId,
  totalPrice,
}: WalletPaymentOptionProps) {
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchWallet() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("club_wallets")
        .select("balance")
        .eq("user_id", user.id)
        .eq("club_id", clubId)
        .single();

      if (data) {
        setWallet(data);
      }
      setIsLoading(false);
    }

    fetchWallet();
  }, [clubId]);

  const handleWalletPayment = async () => {
    setIsProcessing(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to pay with wallet.");
      setIsProcessing(false);
      return;
    }

    const { data, error } = await supabase.rpc("process_wallet_payment", {
      p_user_id: user.id,
      p_booking_id: bookingId,
    });

    if (error) {
      setError(error.message);
    } else if (data && !data.success) {
      setError(data.error);
    } else {
      // Success, redirect to success page
      window.location.reload(); // Reload the page to show the paid status
    }

    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Loading wallet...</p>
      </div>
    );
  }

  if (!wallet || wallet.balance < totalPrice) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 opacity-50">
        <h3 className="font-semibold text-gray-800">Pay with Club Wallet</h3>
        <p className="text-sm text-gray-600">
          Insufficient balance. Your balance is €{wallet?.balance.toFixed(2) || "0.00"}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-800">Pay with Club Wallet</h3>
      <p className="text-sm text-green-700">
        Your balance is €{wallet.balance.toFixed(2)}.
      </p>
      <button
        onClick={handleWalletPayment}
        disabled={isProcessing}
        className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 
          text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200
          flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          `Pay €${totalPrice.toFixed(2)} from Wallet`
        )}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
