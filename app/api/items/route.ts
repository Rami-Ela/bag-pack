import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { categoryId, name, quantity, notes } = await req.json();

    if (!categoryId || !name) {
      return NextResponse.json(
        { error: "categoryId and name are required" },
        { status: 400 },
      );
    }

    const category = await prisma.itemCategory.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
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
    console.error("Error creating item template:", error);
    return NextResponse.json(
      { error: "Failed to create item template" },
      { status: 500 },
    );
  }
}
