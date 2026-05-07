'use client';

import { useState } from 'react';
import { useMessages, useTranslations } from 'next-intl';
import { Item, Trip } from '@/app/types/trips';
import { ItemRow } from './ItemRow';
import { AddItemForm } from './AddItemForm';

function groupByCategory(items: Item[]): { label: string | null; items: Item[] }[] {
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

interface Props {
  trip: Trip;
  onBack: () => void;
  onAddItem: (vars: { name: string; quantity: number }) => void;
  addItemPending: boolean;
  onTogglePacked: (item: Item) => void;
  onToggleBroughtBack: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
}

export function TripDetail({
  trip,
  onBack,
  onAddItem,
  addItemPending,
  onTogglePacked,
  onToggleBroughtBack,
  onDeleteItem,
}: Props) {
  const t = useTranslations('tripDetail');
  const messages = useMessages();
  const categoryTranslations = (messages?.categories ?? {}) as Record<string, string>;
  const [tab, setTab] = useState<'packing' | 'return'>('packing');

  const visibleItems =
    tab === 'return' ? trip.items.filter((i) => i.packed) : trip.items;

  const isEmpty =
    trip.items.length === 0 ||
    (tab === 'return' && trip.items.every((i) => !i.packed));

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
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{trip.name}</h2>
            {trip.destination && (
              <p className="text-sm text-gray-500">📍 {trip.destination}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('packing')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'packing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t('packingTab')}
          </button>
          <button
            onClick={() => setTab('return')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'return' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t('returnTab')}
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {isEmpty ? (
          <p className="text-center text-gray-400 mt-16 text-sm">
            {trip.items.length === 0 ? t('noItems') : t('noPackedItems')}
          </p>
        ) : (
          groupByCategory(visibleItems).map(({ label, items }) => (
            <div key={label ?? '__uncategorized__'}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-1 mb-2">
                {label ? (categoryTranslations[label] ?? label) : (categoryTranslations['other'] ?? 'Autre')}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    tab={tab}
                    onToggle={() => (tab === 'packing' ? onTogglePacked(item) : onToggleBroughtBack(item))}
                    onDelete={() => onDeleteItem(item)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add item form — packing tab only */}
      {tab === 'packing' && (
        <div className="p-4 bg-white border-t border-gray-200">
          <AddItemForm onSubmit={onAddItem} isPending={addItemPending} />
        </div>
      )}
    </div>
  );
}
