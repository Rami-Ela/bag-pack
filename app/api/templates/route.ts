import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { unauthorized } from "@/lib/auth/api";
import { parseTemplateInput } from "@/lib/templates/input";
import {
  itemsCreateData,
  ownsCategories,
  templateInclude,
} from "@/lib/templates/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const templates = await prisma.tripTemplate.findMany({
      where: { userId },
      include: templateInclude,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const input = parseTemplateInput(await req.json());
    if ("error" in input) return NextResponse.json(input, { status: 400 });
    if (!(await ownsCategories(userId, input))) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const template = await prisma.tripTemplate.create({
      data: {
        userId,
        name: input.name,
        emoji: input.emoji,
        items: { create: itemsCreateData(input) },
      },
      include: templateInclude,
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}
