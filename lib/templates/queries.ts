import { prisma } from "@/lib/prisma";
import { TemplateInput } from "./input";

export const templateInclude = {
  items: {
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      categoryId: true,
      quantity: true,
      perDay: true,
    },
  },
} as const;

// True when every category referenced by the input belongs to the user.
export async function ownsCategories(
  userId: string,
  input: TemplateInput,
): Promise<boolean> {
  const ids = [
    ...new Set(
      input.items.map((i) => i.categoryId).filter((id): id is string => !!id),
    ),
  ];
  if (ids.length === 0) return true;
  const owned = await prisma.itemCategory.count({
    where: { userId, id: { in: ids } },
  });
  return owned === ids.length;
}

export function itemsCreateData(input: TemplateInput) {
  return input.items.map((item, position) => ({ ...item, position }));
}
