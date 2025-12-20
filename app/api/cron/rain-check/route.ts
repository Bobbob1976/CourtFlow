// PHASE 2: Growth Features - Rain-Check Cron Job
// Next.js API route to be called by a cron job for automated rain checks.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getWeatherForecast } from "@/lib/weather-actions";

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, clubs(city)") // Assuming clubs table has a 'city' column
    .eq("status", "confirmed")
    .lte("booking_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Within the next 24 hours
    .is("weather_checked_at", null);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  let processedCount = 0;
  for (const booking of bookings) {
    const cityName = booking.clubs.city;
    if (!cityName) continue;

    const { data: forecast, error: weatherError } = await getWeatherForecast(cityName);

    if (weatherError) {
      console.error(`Failed to get weather for ${cityName}:`, weatherError);
      continue;
    }

    if (forecast?.isRaining) {
      // Rain is forecasted, cancel and refund the booking
      await supabase.rpc("credit_wallet", {
        p_user_id: booking.user_id,
        p_club_id: booking.club_id,
        p_amount: booking.total_cost,
        p_reason: "Rain-check refund",
        p_reference_id: booking.id,
      });

      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: "rain_check",
          refund_status: "credited",
          weather_checked_at: new Date().toISOString(),
          weather_forecast: forecast.details,
        })
        .eq("id", booking.id);
    } else {
      // No rain, just mark as checked
      await supabase
        .from("bookings")
        .update({
          weather_checked_at: new Date().toISOString(),
          weather_forecast: forecast?.details,
        })
        .eq("id", booking.id);
    }
    processedCount++;
  }

  return NextResponse.json({ success: true, processed_count: processedCount });
}
