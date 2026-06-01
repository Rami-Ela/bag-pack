import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_USER_ID = 'default-user';

export async function GET() {
  try {
    const categories = await prisma.itemCategory.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, color: true },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, name, color } = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    const category = await prisma.itemCategory.create({
      data: {
        userId,
        name,
        color: color || '#3B82F6',
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
