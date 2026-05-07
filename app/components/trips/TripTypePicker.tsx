'use client';

import { TripType, TRIP_TYPES } from '@/app/types/trips';

interface Props {
  value: TripType;
  onChange: (value: TripType) => void;
}

export function TripTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {TRIP_TYPES.map(({ value: v, label, emoji }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-col items-center gap-0.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
            value === v
              ? 'bg-blue-50 border-blue-400 text-blue-700'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <span className="text-lg leading-none">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
