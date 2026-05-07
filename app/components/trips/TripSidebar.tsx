"use client";

import { Trip } from "@/app/types/trips";
import { CreateTripVars } from "@/app/hooks/useTripMutations";
import { CreateTripForm } from "./CreateTripForm";
import { TripCard } from "./TripCard";

interface Props {
  trips: Trip[];
  selectedTripId: string | null | undefined;
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: (vars: CreateTripVars) => void;
  createTripPending: boolean;
  onDeleteTrip: (trip: Trip) => void;
}

export function TripSidebar({
  trips,
  selectedTripId,
  onSelectTrip,
  onCreateTrip,
  createTripPending,
  onDeleteTrip,
}: Props) {
  console.log({ trips });
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900 mb-4">🎒 Bag Pack</h1>
        <CreateTripForm onSubmit={onCreateTrip} isPending={createTripPending} />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 bg-gray-50">
        {trips.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">No trips yet</p>
        )}
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isSelected={selectedTripId === trip.id}
            onSelect={() => onSelectTrip(trip)}
            onDelete={() => onDeleteTrip(trip)}
          />
        ))}
      </nav>
    </div>
  );
}
