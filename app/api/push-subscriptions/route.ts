import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isHttpsUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Body is PushSubscription.toJSON(): { endpoint, keys: { p256dh, auth } }.
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { endpoint, keys } = await req.json();
    if (
      !isHttpsUrl(endpoint) ||
      !isNonEmptyString(keys?.p256dh) ||
      !isNonEmptyString(keys?.auth)
    ) {
      return NextResponse.json(
        { error: "endpoint (https URL) and keys.p256dh, keys.auth are required" },
        { status: 400 },
      );
    }

    // Upsert on the device endpoint: the device now belongs to whoever is logged in.
    const data = { userId, p256dh: keys.p256dh, auth: keys.auth };
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, ...data },
      update: data,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { endpoint } = await req.json();
    if (!isNonEmptyString(endpoint)) {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete push subscription" },
      { status: 500 },
    );
  }
}
