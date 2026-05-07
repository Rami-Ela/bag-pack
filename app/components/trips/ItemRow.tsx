'use client';

import { useMessages } from 'next-intl';
import { Item } from '@/app/types/trips';
import { CheckIcon } from './CheckIcon';

interface Props {
  item: Item;
  tab: 'packing' | 'return';
  onToggle: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, tab, onToggle, onDelete }: Props) {
  const checked = tab === 'packing' ? item.packed : item.broughtBack;
  const messages = useMessages();
  const presets = (messages?.presets ?? {}) as Record<string, string>;
  const displayName = presets[item.name] ?? item.name;

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-4 rounded-xl border border-gray-200">
      <button
        onClick={onToggle}
        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked
            ? tab === 'packing'
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-blue-500 border-blue-500 text-white'
            : 'border-gray-300'
        }`}
      >
        {checked && <CheckIcon />}
      </button>

      <span className={`flex-1 font-medium transition-colors ${checked ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
        {displayName}
        {item.quantity > 1 && (
          <span className="ml-2 text-sm font-normal" style={{ textDecoration: 'none' }}>
            × {item.quantity}
          </span>
        )}
      </span>

      {tab === 'packing' && (
        <button
          onClick={onDelete}
          className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 active:text-red-500 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
