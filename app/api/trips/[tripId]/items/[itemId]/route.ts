import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
