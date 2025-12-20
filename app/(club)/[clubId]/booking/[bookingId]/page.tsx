// PHASE 1 FINALE: Checkout Page Component
// Booking details and payment page for Stripe Checkout

"use client"; // Make this a client component to handle state

import { useState, useEffect } from "react";
import {
  createCheckoutSession,
  getBookingForCheckout,
  createSplitCheckoutSession,
} from "@/lib/checkout-actions";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import WalletPaymentOption from "@/components/checkout/WalletPaymentOption"; // <--- NIEUWE IMPORT

interface BookingDetails {
  id: string;
  club_id: string;
  court_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: string;
  payment_status: string;
  attendees: number;
  booking_notes?: string;
  clubs: {
    id: string;
    name: string;
    subdomain: string;
    stripe_account_id: string;
  };
  courts: {
    id: string;
    name: string;
    court_type: string;
  };
}

interface BookingShare {
  id: string;
  payment_status: string;
  payment_link_token: string;
  share_number: number;
}

// 'async' verwijderd hier, want dit is een Client Component ("use client")
export default function BookingCheckoutPage({
  params,
}: {
  params: { clubId: string; bookingId: string };
}) {
  const { bookingId } = params;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [shares, setShares] = useState<BookingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookingData() {
      const result = await getBookingForCheckout(bookingId);
      if (result.success && result.data) {
        setBooking(result.data);
        // Here you would also fetch or create the booking_shares
        // For this example, we'll mock creating them if they don't exist.
        await createOrFetchShares(result.data);
      } else {
        setError(
          result.error ||
            "The booking could not be found or you do not have permission to view it."
        );
      }
      setLoading(false);
    }

    fetchBookingData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">
              Booking Not Found
            </div>
            <p className="text-gray-600">
              {error ||
                "The booking could not be found or you do not have permission to view it."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if booking is already paid
  if (booking.payment_status === "paid") {
    // In een echte app gebruik je hier router.push ipv redirect in render
    // Maar voor nu laten we dit staan of renderen we een succes bericht
    window.location.href = `/club/${booking.clubs.subdomain}/booking/success?booking_id=${bookingId}`;
    return null;
  }

  // Check if club has Stripe Connect setup
  if (!booking.clubs.stripe_account_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-orange-600 text-xl font-semibold mb-4">
              Payment Setup Required
            </div>
            <p className="text-gray-600">
              This club has not completed their payment setup. Please contact
              the club administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper to create shares if they don't exist for the demo
  async function createOrFetchShares(bookingData: BookingDetails) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let { data: existingShares, error } = await supabase
      .from("booking_shares")
      .select("*")
      .eq("booking_id", bookingData.id);

    if (error) {
      console.error("Error fetching shares:", error);
      return;
    }

    if (!existingShares || existingShares.length === 0) {
      const numShares = bookingData.attendees;
      const shareAmount = bookingData.total_cost / numShares;
      const newShares = Array.from({ length: numShares }, (_, i) => ({
        booking_id: bookingData.id,
        share_amount: shareAmount,
        service_fee: 0.25,
        total_amount: shareAmount + 0.25,
        share_number: i + 1,
      }));

      const { data: createdShares, error: createError } = await supabase
        .from("booking_shares")
        .insert(newShares)
        .select();
      if (createdShares) setShares(createdShares);
    } else {
      setShares(existingShares as BookingShare[]);
    }
  }

  // Format date and time
  const bookingDate = new Date(booking.booking_date).toLocaleDateString(
    "nl-NL",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const startTime = booking.start_time.slice(0, 5);
  const endTime = booking.end_time.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-600">
            Review your booking details and proceed to secure payment.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Club</div>
              <div className="text-gray-900">{booking.clubs.name}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Court</div>
              <div className="text-gray-900">
                {booking.courts.name} ({booking.courts.court_type})
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="text-gray-900">{bookingDate}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Time</div>
              <div className="text-gray-900">
                {startTime} - {endTime}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Attendees</div>
              <div className="text-gray-900">
                {booking.attendees} person{booking.attendees > 1 ? "s" : ""}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="text-orange-600 font-medium">Pending Payment</div>
            </div>
          </div>

          {booking.booking_notes && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Notes
              </div>
              <div className="text-gray-900 bg-gray-50 p-3 rounded border">
                {booking.booking_notes}
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Details
            </h2>
            <div className="text-2xl font-bold text-gray-900">
              €{booking.total_cost.toFixed(2)}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-0.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">
                  Secure Payment via Stripe
                </div>
                <div>
                  Your payment is processed securely by Stripe. The club will
                  receive your payment directly, and no additional fees will be
                  charged by our platform.
                </div>
              </div>
            </div>
          </div>

          <CheckoutForm booking={booking} shares={shares} />
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({
  booking,
  shares,
}: {
  booking: BookingDetails;
  shares: BookingShare[];
}) {
  const [paymentOption, setPaymentOption] = useState<"full" | "split">("full");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession({ bookingId: booking.id });

      if (result.success && result.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else {
        setError(result.error || "Payment initialization failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSplitPayment = async (shareId: string) => {
    setIsLoading(true);
    setError(null);

    const result = await createSplitCheckoutSession({
      bookingId: booking.id,
      shareId: shareId,
      numberOfSplits: shares.length,
    });
    if (result.success && result.data?.url) {
      window.location.href = result.data.url;
    } else {
      setError(result.error || "Payment initialization failed");
      setIsLoading(false);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/pay/share/${token}`;
    navigator.clipboard.writeText(url);
    alert(`Link gekopieerd: ${url}`);
  };

  return (
    <div className="space-y-6">
      {/* --- 1. NIEUW: WALLET OPTION --- */}
      <WalletPaymentOption
        bookingId={booking.id}
        clubId={booking.club_id}
        totalPrice={booking.total_cost}
      />

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">
          Of betaal via Bank
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* --- 2. BESTAAND: STRIPE OPTIONS --- */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setPaymentOption("full")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            paymentOption === "full"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Betaal alles zelf
        </button>
        <button
          onClick={() => setPaymentOption("split")}
          disabled={booking.attendees <= 1}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            paymentOption === "split"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          Splits de rekening
          <span className="ml-1 text-xs bg-green-100 text-green-800 font-semibold px-1.5 py-0.5 rounded-full">
            NIEUW
          </span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-red-800 font-medium">Payment Error</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Payment Form */}
      {paymentOption === "full" && (
        <form action={handlePayment}>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-3">
              By proceeding with payment, you agree to the booking terms and
              conditions.
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
            text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200
            flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Pay €{booking.total_cost.toFixed(2)} Securely
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Split Payment UI */}
      {paymentOption === "split" && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-sm text-gray-600">
            Betaal jouw deel en deel de link met je medespelers. Ieder betaalt{" "}
            <span className="font-semibold">
              €{(booking.total_cost / shares.length).toFixed(2)}
            </span>{" "}
            (+ €0.25 servicekosten).
          </p>
          <div className="space-y-2">
            {shares.map((share, index) => (
              <div
                key={share.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg border"
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      share.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {share.share_number}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      Speler {share.share_number} {index === 0 ? "(Jij)" : ""}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        share.payment_status === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {share.payment_status === "paid"
                        ? "Betaald"
                        : "Wacht op betaling"}
                    </div>
                  </div>
                </div>
                {share.payment_status !== "paid" &&
                  (index === 0 ? (
                    <button
                      onClick={() => handleSplitPayment(share.id)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      Betaal nu
                    </button>
                  ) : (
                    <button
                      onClick={() => copyShareLink(share.payment_link_token)}
                      className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-300"
                    >
                      Kopieer Link
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Badges */}
      <div className="text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            SSL Secured
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            PCI Compliant
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Stripe Verified
          </div>
        </div>
      </div>
    </div>
  );
}
