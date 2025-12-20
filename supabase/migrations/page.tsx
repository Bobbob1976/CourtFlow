// PHASE 2: Guest Payment Page for Split Payments

"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createSplitCheckoutSession } from "@/lib/checkout-actions";

// =============================================================================
// TYPES
// =============================================================================

interface ShareDetails {
  share: {
    id: string;
    share_number: number;
    amount: number;
    service_fee: number;
    total_amount: number;
    payment_status: "pending" | "paid";
    payment_link_token: string;
  };
  booking: {
    id: string;
    club_name: string;
    court_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
  };
  total_shares: number;
}

interface PageState {
  loading: boolean;
  error: string | null;
  details: ShareDetails | null;
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function PaySharePage({
  params,
}: {
  params: { token: string };
}) {
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    details: null,
  });

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchShareDetails() {
      // Use the secure RPC function to get share details via token
      const { data, error } = await supabase.rpc("get_share_by_token", {
        p_token: params.token,
      });

      if (error || !data) {
        setState({
          loading: false,
          error: "Deze betaallink is ongeldig of verlopen.",
          details: null,
        });
        return;
      }

      // Check if this share is already paid
      if (data.share.payment_status === "paid") {
        setState({
          loading: false,
          error: "Dit deel van de betaling is al voldaan.",
          details: data,
        });
        return;
      }

      setState({ loading: false, error: null, details: data });
    }

    fetchShareDetails();
  }, [params.token]);

  if (state.loading) {
    return <LoadingSkeleton />;
  }

  if (state.error && !state.details) {
    return <ErrorDisplay message={state.error} />;
  }

  if (!state.details) {
    return (
      <ErrorDisplay message="Kon de details van de betaling niet laden." />
    );
  }

  const { share, booking } = state.details;
  const bookingDate = new Date(booking.booking_date).toLocaleDateString(
    "nl-NL",
    { weekday: "long", day: "numeric", month: "long" }
  );
  const startTime = booking.start_time.slice(0, 5);
  const endTime = booking.end_time.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Je bent uitgenodigd!
          </h1>
          <p className="text-gray-600 mt-2">
            Betaal jouw deel voor een potje padel bij{" "}
            <span className="font-semibold">{booking.club_name}</span>.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <DetailRow label="Baan" value={booking.court_name} />
          <DetailRow label="Datum" value={bookingDate} />
          <DetailRow label="Tijd" value={`${startTime} - ${endTime}`} />
        </div>

        {/* Payment Details */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-600">Jouw deel</span>
            <span className="font-medium text-gray-800">
              €{share.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Servicekosten</span>
            <span className="font-medium text-gray-800">
              €{share.service_fee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold border-t pt-4 mt-4">
            <span className="text-gray-900">Totaal te betalen</span>
            <span className="text-blue-600">
              €{share.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Button Form */}
        <PaymentForm details={state.details} error={state.error} />
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function PaymentForm({
  details,
  error: pageError,
}: {
  details: ShareDetails;
  error: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setActionError(null);

    const result = await createSplitCheckoutSession({
      bookingId: details.booking.id,
      shareId: details.share.id,
      numberOfSplits: details.total_shares,
    });

    if (result.success && result.data?.url) {
      window.location.href = result.data.url;
    } else {
      setActionError(result.error || "Het starten van de betaling is mislukt.");
      setIsLoading(false);
    }
  };

  const isAlreadyPaid = details.share.payment_status === "paid";

  return (
    <div className="space-y-4">
      {(pageError || actionError) && (
        <div className="bg-yellow-50 text-yellow-800 text-center p-3 rounded-lg text-sm">
          {pageError || actionError}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={isLoading || isAlreadyPaid}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading
          ? "Moment..."
          : isAlreadyPaid
          ? "Al Betaald"
          : `Betaal €${details.share.total_amount.toFixed(2)} Veilig`}
      </button>
    </div>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="border-t pt-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-blue-200 rounded w-full mt-4"></div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Er is iets misgegaan</h2>
      <p className="text-gray-600 mt-2">{message}</p>
    </div>
  </div>
);
