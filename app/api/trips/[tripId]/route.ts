import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

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
