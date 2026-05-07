import { prisma } from '@/lib/prisma';
import { TripType } from '@/app/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_USER_ID = 'default-user';

const VALID_TRIP_TYPES = new Set<string>(Object.values(TripType));

function tripDurationDays(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 7; // sensible default when dates are omitted
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000) + 1); // inclusive of both end-points
}

export async function GET() {
  try {
    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: { id: DEFAULT_USER_ID, email: 'user@bagpack.app', name: 'Default User' },
    });

    const trips = await prisma.trip.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        items: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, destination, tripType, startDate, endDate } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const resolvedTripType: TripType =
      tripType && VALID_TRIP_TYPES.has(tripType) ? (tripType as TripType) : TripType.OTHER;

    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: { id: DEFAULT_USER_ID, email: 'user@bagpack.app', name: 'Default User' },
    });

    const presets = await prisma.tripPreset.findMany({ where: { tripType: resolvedTripType } });
    const duration = tripDurationDays(startDate ?? null, endDate ?? null);

    const trip = await prisma.trip.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        destination: destination || null,
        tripType: resolvedTripType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        items: {
          create: presets.map((p) => ({
            name: p.name,
            quantity: p.perDay ? p.baseQuantity * duration : p.baseQuantity,
          })),
        },
      },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
