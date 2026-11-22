import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { unauthorized } from "@/lib/auth/api";
import { sendTripReminders } from "@/lib/notifications/trip-reminders";

// Vercel Schedules (path target) sends "Authorization: Bearer $CRON_SECRET". Hashing both sides gives
// equal-length buffers, as timingSafeEqual requires.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (!secret || !header) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const summary = await sendTripReminders();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error sending trip reminders:", error);
    return NextResponse.json(
      { error: "Failed to send trip reminders" },
      { status: 500 },
    );
  }
}
