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

type Params = { params: Promise<{ templateId: string }> };

// Full replacement: the item list sent by the editor becomes the template's list.
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { templateId } = await params;
    const input = parseTemplateInput(await req.json());
    if ("error" in input) return NextResponse.json(input, { status: 400 });

    const existing = await prisma.tripTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }
    if (!(await ownsCategories(userId, input))) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const template = await prisma.tripTemplate.update({
      where: { id: templateId },
      data: {
        name: input.name,
        emoji: input.emoji,
        items: { deleteMany: {}, create: itemsCreateData(input) },
      },
      include: templateInclude,
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorized();

    const { templateId } = await params;
    const { count } = await prisma.tripTemplate.deleteMany({
      where: { id: templateId, userId },
    });
    if (count === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
