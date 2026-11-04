import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function isValidDay(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && ISO_DAY.test(value));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { tripId } = await params;
    const { startDate, endDate } = await req.json();

    if (!isValidDay(startDate) || !isValidDay(endDate)) {
      return NextResponse.json(
        { error: "startDate and endDate must be YYYY-MM-DD or null" },
        { status: 400 },
      );
    }
    if (startDate && endDate && endDate < startDate) {
      return NextResponse.json(
        { error: "endDate must not be before startDate" },
        { status: 400 },
      );
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Item quantities are not recomputed: they may have been adjusted by hand since creation.
    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating trip dates:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { tripId } = await params;

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    await prisma.trip.delete({ where: { id: tripId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 },
    );
  }
}
