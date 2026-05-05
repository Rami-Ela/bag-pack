import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_USER_ID = 'default-user';

export async function GET() {
  try {
    // Ensure default user exists
    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: { id: DEFAULT_USER_ID, email: 'user@bagpack.app', name: 'Default User' },
    });

    const trips = await prisma.trip.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        items: {
          include: { category: true },
          orderBy: { createdAt: 'asc' },
        },
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
    const { name, destination } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: { id: DEFAULT_USER_ID, email: 'user@bagpack.app', name: 'Default User' },
    });

    const trip = await prisma.trip.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        destination: destination || null,
      },
      include: { items: true },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
