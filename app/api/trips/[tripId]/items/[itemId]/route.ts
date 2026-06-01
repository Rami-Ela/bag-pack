import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const { quantity } = await req.json();

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'quantity must be >= 1' }, { status: 400 });
    }

    const item = await prisma.packingListItem.findUnique({ where: { id: itemId } });
    if (!item || item.tripId !== tripId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updated = await prisma.packingListItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;

    const item = await prisma.packingListItem.findUnique({ where: { id: itemId } });

    if (!item || item.tripId !== tripId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.packingListItem.delete({ where: { id: itemId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
