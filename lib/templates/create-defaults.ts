import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "./defaults";

// Gives a freshly created account the default templates and the categories they use.
export async function createDefaultTemplates(userId: string): Promise<void> {
  const categoryNames = [
    ...new Set(
      DEFAULT_TEMPLATES.flatMap((t) => t.items.map((i) => i.category)),
    ),
  ];

  await prisma.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const name of categoryNames) {
      const category = await tx.itemCategory.create({ data: { userId, name } });
      categoryIds.set(name, category.id);
    }

    for (const template of DEFAULT_TEMPLATES) {
      await tx.tripTemplate.create({
        data: {
          userId,
          name: template.name,
          emoji: template.emoji,
          items: {
            create: template.items.map((item, position) => ({
              name: item.name,
              categoryId: categoryIds.get(item.category),
              quantity: item.quantity,
              perDay: item.perDay,
              position,
            })),
          },
        },
      });
    }
  });
}
