"use client";

import { useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { Category } from "@/app/types/trips";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  categories: Category[];
  onSubmit: (vars: {
    name: string;
    quantity: number;
    categoryId: string | null;
  }) => void;
  isPending: boolean;
}

export function AddItemForm({ categories, onSubmit, isPending }: Props) {
  const t = useTranslations("addItemForm");
  const messages = useMessages();
  const categoryTranslations = (messages?.categories ?? {}) as Record<
    string,
    string
  >;
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, quantity, categoryId });
    setName("");
    setQuantity(1);
    setCategoryId(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
          required
        />
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-3 rounded-none text-lg leading-none"
          >
            −
          </Button>
          <span className="w-8 text-center text-gray-900 font-medium select-none">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-3 rounded-none text-lg leading-none"
          >
            +
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Select
          value={categoryId ?? ""}
          onValueChange={(v) => setCategoryId(v || null)}
        >
          <SelectTrigger className="w-full h-12! px-4 rounded-xl text-base!">
            <SelectValue>
              {(value: string | null) => {
                if (!value)
                  return (
                    <span className="text-muted-foreground">
                      {t("categoryPlaceholder")}
                    </span>
                  );
                const cat = categories.find((c) => c.id === value);
                return cat
                  ? (categoryTranslations[cat.name] ?? cat.name)
                  : value;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-base">
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {categoryTranslations[cat.name] ?? cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={isPending}
          className="w-12 h-12 text-2xl font-medium rounded-xl"
        >
          +
        </Button>
      </div>
    </form>
  );
}
