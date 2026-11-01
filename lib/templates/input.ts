import { TEMPLATE_EMOJIS } from "./emojis";

export type TemplateItemInput = {
  name: string;
  categoryId: string | null;
  quantity: number;
  perDay: boolean;
};

export type TemplateInput = {
  name: string;
  emoji: string;
  items: TemplateItemInput[];
};

const VALID_EMOJIS = new Set<string>(TEMPLATE_EMOJIS);

// Returns the normalized input, or an error message suitable for a 400 response.
export function parseTemplateInput(
  body: unknown,
): TemplateInput | { error: string } {
  const { name, emoji, items } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim())
    return { error: "name is required" };
  if (typeof emoji !== "string" || !VALID_EMOJIS.has(emoji))
    return { error: "emoji is invalid" };
  if (!Array.isArray(items)) return { error: "items must be an array" };

  const parsedItems: TemplateItemInput[] = [];
  for (const item of items) {
    const {
      name: itemName,
      categoryId,
      quantity,
      perDay,
    } = (item ?? {}) as Record<string, unknown>;
    if (typeof itemName !== "string" || !itemName.trim())
      return { error: "item name is required" };
    if (!Number.isInteger(quantity) || (quantity as number) < 1) {
      return { error: "item quantity must be an integer >= 1" };
    }
    parsedItems.push({
      name: itemName.trim(),
      categoryId:
        typeof categoryId === "string" && categoryId ? categoryId : null,
      quantity: quantity as number,
      perDay: perDay === true,
    });
  }

  return { name: name.trim(), emoji, items: parsedItems };
}
