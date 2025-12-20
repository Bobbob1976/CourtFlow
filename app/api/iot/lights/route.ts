import { NextResponse } from 'next/server';

// TEMPORARY: Placeholder for IoT integration
// Will be upgraded to use @supabase/ssr once hardware is connected.

export async function POST(request: Request) {
  return NextResponse.json({ status: "mock_success", message: "IoT system not connected" });
}
