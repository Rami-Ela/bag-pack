import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { tripId } = await params;
    const { name, quantity, notes, categoryId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (
      categoryId &&
      !(await prisma.itemCategory.findFirst({
        where: { id: categoryId, userId },
      }))
    ) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const item = await prisma.packingListItem.create({
      data: {
        tripId,
        name,
        quantity: quantity || 1,
        notes: notes || null,
        categoryId: categoryId || null,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding item to trip:", error);
    return NextResponse.json(
      { error: "Failed to add item to trip" },
      { status: 500 },
    );
  }
}
