"use client";

import { useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { Category, Item, Trip } from "@/app/types/trips";
import { ItemRow } from "./ItemRow";
import { AddItemForm } from "./AddItemForm";
import { ConfettiBurst } from "./ConfettiBurst";

function groupByCategory(
  items: Item[],
): { label: string | null; items: Item[] }[] {
  const groups: { label: string | null; items: Item[] }[] = [];
  const seen = new Map<string | null, Item[]>();
  for (const item of items) {
    const key = item.category?.name ?? null;
    if (!seen.has(key)) {
      const bucket: Item[] = [];
      seen.set(key, bucket);
      groups.push({ label: key, items: bucket });
    }
    seen.get(key)!.push(item);
  }
  // Uncategorized items sink to the bottom
  const nullIdx = groups.findIndex((g) => g.label === null);
  if (nullIdx > 0) groups.push(groups.splice(nullIdx, 1)[0]);
  return groups;
}

function ProgressGauge({
  done,
  total,
  label,
  completeLabel,
}: {
  done: number;
  total: number;
  label: string;
  completeLabel: string;
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const isComplete = total > 0 && done === total;

  // Confetti fire only on the transition to complete, not when a list is opened already complete
  const [wasComplete, setWasComplete] = useState(isComplete);
  const [burstCount, setBurstCount] = useState(0);
  if (isComplete !== wasComplete) {
    setWasComplete(isComplete);
    if (isComplete) setBurstCount((count) => count + 1);
  }

  return (
    <div className="relative mt-3">
      {burstCount > 0 && <ConfettiBurst key={burstCount} />}
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 bg-gray-100 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${isComplete ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Mounted only once complete, so the entry animation plays when the last item is checked */}
      {isComplete && (
        <p
          key={completeLabel}
          className="mt-2 text-center text-sm font-medium text-green-600 animate-in fade-in zoom-in-50 duration-500 motion-reduce:animate-none"
        >
          {completeLabel}
        </p>
      )}
    </div>
  );
}

interface Props {
  trip: Trip;
  categories: Category[];
  onBack: () => void;
  onAddItem: (vars: {
    name: string;
    quantity: number;
    categoryId: string | null;
  }) => void;
  addItemPending: boolean;
  onTogglePacked: (item: Item) => void;
  onToggleBroughtBack: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onUpdateQuantity: (item: Item, quantity: number) => void;
}

export function TripDetail({
  trip,
  categories,
  onBack,
  onAddItem,
  addItemPending,
  onTogglePacked,
  onToggleBroughtBack,
  onDeleteItem,
  onUpdateQuantity,
}: Props) {
  const t = useTranslations("tripDetail");
  const messages = useMessages();
  const categoryTranslations = (messages?.categories ?? {}) as Record<
    string,
    string
  >;
  const [tab, setTab] = useState<"packing" | "return">("packing");

  const visibleItems =
    tab === "return" ? trip.items.filter((i) => i.packed) : trip.items;

  const packedCount = trip.items.filter((i) => i.packed).length;
  const broughtBackCount = trip.items.filter(
    (i) => i.packed && i.broughtBack,
  ).length;
  const progress =
    tab === "packing"
      ? { done: packedCount, total: trip.items.length }
      : { done: broughtBackCount, total: packedCount };

  const isEmpty =
    trip.items.length === 0 ||
    (tab === "return" && trip.items.every((i) => !i.packed));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {trip.name}
            </h2>
            {trip.destination && (
              <p className="text-sm text-gray-500">📍 {trip.destination}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab("packing")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "packing"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {t("packingTab")}
          </button>
          <button
            onClick={() => setTab("return")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "return"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {t("returnTab")}
          </button>
        </div>

        {progress.total > 0 && (
          <ProgressGauge
            // Fresh state per trip and tab, so switching never triggers confetti
            key={`${trip.id}-${tab}`}
            done={progress.done}
            total={progress.total}
            label={t(
              tab === "packing" ? "packingProgress" : "returnProgress",
              progress,
            )}
            completeLabel={t(
              tab === "packing" ? "packingComplete" : "returnComplete",
            )}
          />
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {isEmpty ? (
          <p className="text-center text-gray-400 mt-16 text-sm">
            {trip.items.length === 0 ? t("noItems") : t("noPackedItems")}
          </p>
        ) : (
          groupByCategory(visibleItems).map(({ label, items }) => (
            <div key={label ?? "__uncategorized__"}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1 mb-2">
                {label
                  ? (categoryTranslations[label] ?? label)
                  : (categoryTranslations["other"] ?? "Autre")}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    tab={tab}
                    onToggle={() =>
                      tab === "packing"
                        ? onTogglePacked(item)
                        : onToggleBroughtBack(item)
                    }
                    onDelete={() => onDeleteItem(item)}
                    onUpdateQuantity={(qty) => onUpdateQuantity(item, qty)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add item form — packing tab only */}
      {tab === "packing" && (
        <div className="p-4 bg-white border-t border-gray-200">
          <AddItemForm
            categories={categories}
            onSubmit={onAddItem}
            isPending={addItemPending}
          />
        </div>
      )}
    </div>
  );
}
