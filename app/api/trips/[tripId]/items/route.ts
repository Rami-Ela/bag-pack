import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_USER_ID = 'default-user';

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

    // Auto-create or reuse a "General" category
    const category = await prisma.itemCategory.upsert({
      where: {
        // We need a unique constraint — use findFirst instead
        id: 'general-category',
      },
      update: {},
      create: {
        id: 'general-category',
        userId: DEFAULT_USER_ID,
        name: 'General',
        color: '#3B82F6',
      },
    });

    const item = await prisma.packingListItem.create({
      data: {
        tripId,
        categoryId: category.id,
        name,
        quantity: quantity || 1,
        notes: notes || null,
      },
      include: { category: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error adding item to trip:', error);
    return NextResponse.json({ error: 'Failed to add item to trip' }, { status: 500 });
  }
}
