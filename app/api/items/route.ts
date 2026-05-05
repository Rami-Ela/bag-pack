import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, categoryId, name, quantity, notes } = await req.json();

    if (!userId || !categoryId || !name) {
      return NextResponse.json(
        { error: 'userId, categoryId, and name are required' },
        { status: 400 }
      );
    }

    const template = await prisma.itemTemplate.create({
      data: {
        userId,
        categoryId,
        name,
        quantity: quantity || 1,
        notes: notes || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating item template:', error);
    return NextResponse.json(
      { error: 'Failed to create item template' },
      { status: 500 }
    );
  }
}
