// lib/admin-actions.ts
"use server";

import { createClient } from "utils/supabase/server";
import { startOfToday, endOfToday, endOfWeek } from "date-fns";

export interface BookingForDashboard {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: "confirmed" | "pending" | "cancelled";
  payment_status: "paid" | "pending" | "failed";
  attendees: number;
  user: {
    full_name: string | null;
    email: string | null;
  } | null;
  court: {
    name: string | null;
  } | null;
  shares: {
    count: number;
  }[];
  paid_shares: {
    count: number;
  }[];
}

interface DashboardData {
  bookings: BookingForDashboard[];
  revenueToday: number;
}

interface GetDashboardDataResult {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

/**
 * Fetches all data required for the admin bookings dashboard.
 * It respects RLS by using the authenticated user's session.
 * @param clubId The ID of the club to fetch data for.
 */
export async function getBookingsDashboardData(
  clubId: string
): Promise<GetDashboardDataResult> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch bookings with related user, court, and share counts
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id, booking_date, start_time, end_time, total_cost, status, payment_status, attendees,
        user:user_profiles ( full_name, email ),
        court:courts ( name ),
        shares:booking_shares(count),
        paid_shares:booking_shares(count)
      `
      )
      .eq("club_id", clubId)
      .gte("booking_date", startOfToday().toISOString()) // From today onwards
      .lte("booking_date", endOfWeek(new Date()).toISOString()) // Until end of this week
      .eq("paid_shares.payment_status", "paid") // Filter for the paid_shares count
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (bookingsError) {
      console.error("Error fetching dashboard bookings:", bookingsError);
      return { success: false, error: bookingsError.message };
    }

    // Calculate revenue for today
    const today = startOfToday().toISOString().split("T")[0];
    const revenueToday = bookings
      .filter(
        (b) =>
          b.booking_date === today &&
          b.status === "confirmed" &&
          b.payment_status === "paid"
      )
      .reduce((sum, b) => sum + b.total_cost, 0);

    return {
      success: true,
      data: { bookings: bookings as any, revenueToday },
    };
  } catch (error) {
    console.error("Unexpected error in getBookingsDashboardData:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
