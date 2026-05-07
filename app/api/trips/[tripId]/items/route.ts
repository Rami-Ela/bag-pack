import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const { name, quantity, notes } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const item = await prisma.packingListItem.create({
      data: {
        tripId,
        name,
        quantity: quantity || 1,
        notes: notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding item to trip:', error);
    return NextResponse.json({ error: 'Failed to add item to trip' }, { status: 500 });
  }
}
