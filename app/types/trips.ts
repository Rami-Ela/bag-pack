export interface Item {
  id: string;
  name: string;
  quantity: number;
  packed: boolean;
  broughtBack: boolean;
}

export type TripType = 'BEACH' | 'CITY' | 'BUSINESS' | 'SKI' | 'HIKING' | 'OTHER';

export const TRIP_TYPES: { value: TripType; label: string; emoji: string }[] = [
  { value: 'BEACH',    label: 'Beach',    emoji: '🏖️' },
  { value: 'CITY',     label: 'City',     emoji: '🏙️' },
  { value: 'BUSINESS', label: 'Business', emoji: '💼' },
  { value: 'SKI',      label: 'Ski',      emoji: '🎿' },
  { value: 'HIKING',   label: 'Hiking',   emoji: '🥾' },
  { value: 'OTHER',    label: 'Other',    emoji: '📦' },
];

export interface Trip {
  id: string;
  name: string;
  destination: string | null;
  tripType: TripType;
  startDate: string | null;
  endDate: string | null;
  items: Item[];
}
