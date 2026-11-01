import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

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

    const { name, destination, templateId, startDate, endDate } =
      await req.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // No template means an empty trip; the template's items are copied, not linked.
    const template = templateId
      ? await prisma.tripTemplate.findFirst({
          where: { id: templateId, userId },
          include: { items: { orderBy: { position: "asc" } } },
        })
      : null;
    if (templateId && !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }
    const duration = tripDurationDays(startDate ?? null, endDate ?? null);

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        destination: destination || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        items: {
          create: (template?.items ?? []).map((item) => ({
            name: item.name,
            categoryId: item.categoryId,
            quantity: item.perDay ? item.quantity * duration : item.quantity,
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
