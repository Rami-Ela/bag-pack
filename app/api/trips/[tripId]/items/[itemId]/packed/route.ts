import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const { packed } = await req.json();

    if (typeof packed !== 'boolean') {
      return NextResponse.json(
        { error: 'packed must be a boolean' },
        { status: 400 }
      );
    }

    // Verify item exists and belongs to trip
    const item = await prisma.packingListItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.tripId !== tripId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
    console.error('Error updating item packed status:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
