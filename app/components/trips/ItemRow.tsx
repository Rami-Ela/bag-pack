'use client';

import { useMessages } from 'next-intl';
import { Item } from '@/app/types/trips';
import { CheckIcon } from './CheckIcon';

interface Props {
  item: Item;
  tab: 'packing' | 'return';
  onToggle: () => void;
  onDelete: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function ItemRow({ item, tab, onToggle, onDelete, onUpdateQuantity }: Props) {
  const checked = tab === 'packing' ? item.packed : item.broughtBack;
  const messages = useMessages();
  const presets = (messages?.presets ?? {}) as Record<string, string>;
  const displayName = presets[item.name] ?? item.name;

  return (
    <div className="w-full flex items-center gap-3 bg-white px-4 py-4 rounded-xl border border-gray-200 transition-colors text-left">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 active:opacity-60 transition-opacity text-left"
      >
        <span
          className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
            checked
              ? tab === 'packing'
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300'
          }`}
        >
          {checked && <CheckIcon />}
        </span>

        <span className={`font-medium transition-colors ${checked ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
          {displayName}
        </span>
      </button>

      {tab === 'return' && (
        <span className="shrink-0 text-sm text-gray-400 font-medium tabular-nums">
          × {item.quantity}
        </span>
      )}

      {tab === 'packing' && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base"
          >
            −
          </button>
          <span className="w-5 text-center text-sm text-gray-600 font-medium tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-base"
          >
            +
          </button>
          <button
            onClick={onDelete}
            className="ml-1 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 active:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
