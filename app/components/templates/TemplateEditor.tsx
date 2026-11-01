"use client";

import { useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { Category, Template, TemplateItem } from "@/app/types/trips";
import { TEMPLATE_EMOJIS } from "@/lib/templates/emojis";

export type TemplateDraft = Omit<Template, "id">;

// Rows need a stable React key, including rows not saved yet.
type Row = TemplateItem & { key: number };

const INPUT_CLASS =
  "px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500";

let nextRowKey = 0;
const toRow = (item: TemplateItem): Row => ({ ...item, key: nextRowKey++ });
const emptyRow = () =>
  toRow({ name: "", categoryId: null, quantity: 1, perDay: false });

interface Props {
  initial: Template | null;
  categories: Category[];
  isSaving: boolean;
  hasError: boolean;
  onSave: (draft: TemplateDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function TemplateEditor({
  initial,
  categories,
  isSaving,
  hasError,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  const t = useTranslations("templates");
  const messages = useMessages();
  const categoryTranslations = (messages?.categories ?? {}) as Record<
    string,
    string
  >;

  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState<string>(
    initial?.emoji ?? TEMPLATE_EMOJIS[0],
  );
  const [rows, setRows] = useState<Row[]>(() =>
    initial ? initial.items.map(toRow) : [emptyRow()],
  );

  const updateRow = (key: number, patch: Partial<TemplateItem>) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      emoji,
      // Blank rows are leftovers of "add item", not meaningful items.
      items: rows
        .filter((row) => row.name.trim())
        .map(({ name, categoryId, quantity, perDay }) => ({
          name: name.trim(),
          categoryId,
          quantity,
          perDay,
        })),
    });
  };

  return (
    <div className="min-h-dvh bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {initial ? t("editTitle") : t("createTitle")}
          </h1>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-blue-600 hover:underline"
          >
            {t("cancel")}
          </button>
        </div>

        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className={`w-full ${INPUT_CLASS} py-3`}
            required
          />
          <div>
            <p className="text-xs text-gray-500 mb-1.5 pl-1">{t("logo")}</p>
            <div className="grid grid-cols-6 gap-1.5">
              {TEMPLATE_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  aria-pressed={emoji === e}
                  className={`py-2 text-xl leading-none rounded-lg border transition-colors ${
                    emoji === e
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-900">{t("items")}</h2>
          {rows.map((row) => (
            <div
              key={row.key}
              className="space-y-2 pb-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  placeholder={t("itemPlaceholder")}
                  className={`flex-1 min-w-0 ${INPUT_CLASS}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => prev.filter((r) => r.key !== row.key))
                  }
                  aria-label={t("removeItem")}
                  className="px-3 text-gray-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={row.categoryId ?? ""}
                  onChange={(e) =>
                    updateRow(row.key, { categoryId: e.target.value || null })
                  }
                  className={`flex-1 min-w-0 ${INPUT_CLASS}`}
                >
                  <option value="">{t("noCategory")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {categoryTranslations[cat.name] ?? cat.name}
                    </option>
                  ))}
                </select>
                <div
                  className="flex items-center border border-gray-300 rounded-lg"
                  aria-label={t("quantity")}
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateRow(row.key, {
                        quantity: Math.max(1, row.quantity - 1),
                      })
                    }
                    className="px-2 py-2 text-gray-700"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm text-gray-900 select-none">
                    {row.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateRow(row.key, { quantity: row.quantity + 1 })
                    }
                    className="px-2 py-2 text-gray-700"
                  >
                    +
                  </button>
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={row.perDay}
                    onChange={(e) =>
                      updateRow(row.key, { perDay: e.target.checked })
                    }
                  />
                  {t("perDay")}
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            className="w-full py-2 border border-dashed border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
          >
            {t("addItem")}
          </button>
        </section>

        {hasError && <p className="text-sm text-red-600">{t("saveError")}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {t("save")}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
          >
            {t("delete")}
          </button>
        )}
      </form>
    </div>
  );
}
