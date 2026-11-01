import { prisma } from "@/lib/prisma";
import { TripType } from "@/app/generated/prisma/client";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

const VALID_TRIP_TYPES = new Set<string>(Object.values(TripType));

function tripDurationDays(
  startDate: string | null,
  endDate: string | null,
): number {
  if (!startDate || !endDate) return 7; // sensible default when dates are omitted
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000) + 1); // inclusive of both end-points
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { name, destination, tripType, startDate, endDate } =
      await req.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const resolvedTripType: TripType =
      tripType && VALID_TRIP_TYPES.has(tripType)
        ? (tripType as TripType)
        : TripType.OTHER;

    const presets = await prisma.tripPreset.findMany({
      where: { tripType: resolvedTripType },
    });
    const duration = tripDurationDays(startDate ?? null, endDate ?? null);

    // Upsert an ItemCategory for each unique preset category name
    const uniqueCategoryNames = [
      ...new Set(presets.map((p) => p.category).filter(Boolean)),
    ];
    const categoryMap = new Map<string, string>();
    for (const catName of uniqueCategoryNames) {
      let cat = await prisma.itemCategory.findFirst({
        where: { userId, name: catName },
      });
      if (!cat) {
        cat = await prisma.itemCategory.create({
          data: { userId, name: catName },
        });
      }
      categoryMap.set(catName, cat.id);
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        destination: destination || null,
        tripType: resolvedTripType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        items: {
          create: presets.map((p) => ({
            name: p.name,
            categoryId: p.category ? categoryMap.get(p.category) : undefined,
            quantity: p.perDay ? p.baseQuantity * duration : p.baseQuantity,
          })),
        },
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 },
    );
  }
}
