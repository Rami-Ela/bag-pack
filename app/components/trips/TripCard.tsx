'use client';

import { useTranslations } from 'next-intl';
import { Trip } from '@/app/types/trips';

interface Props {
  trip: Trip;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function TripCard({ trip, isSelected, onSelect, onDelete }: Props) {
  const t = useTranslations('tripCard');

  return (
    <div
      className={`flex items-center gap-1 rounded-xl mb-2 border transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
      }`}
    >
      <button onClick={onSelect} className="flex-1 text-left px-4 py-4">
        <p className={`font-semibold text-base ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
          {trip.name}
        </p>
        {trip.destination && (
          <p className="text-sm text-gray-400 mt-0.5">📍 {trip.destination}</p>
        )}
        <p className="text-sm text-gray-400 mt-0.5">
          {t('itemCount', { count: trip.items?.length ?? 0 })}
        </p>
      </button>
      <button
        onClick={onDelete}
        className="px-4 py-4 text-gray-300 hover:text-red-500 active:text-red-600 transition-colors text-lg"
      >
        ✕
      </button>
    </div>
  );
}
