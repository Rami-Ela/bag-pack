import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { tripId, itemId } = await params;
    const { packed } = await req.json();

    if (typeof packed !== "boolean") {
      return NextResponse.json(
        { error: "packed must be a boolean" },
        { status: 400 },
      );
    }

    // Verify item exists and belongs to a trip of the current user
    const item = await prisma.packingListItem.findFirst({
      where: { id: itemId, tripId, trip: { userId } },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.packingListItem.update({
      where: { id: itemId },
      data: { packed },
      include: {
        category: true,
        template: true,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item packed status:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}
