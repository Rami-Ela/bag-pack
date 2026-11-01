"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Template, Trip } from "@/app/types/trips";
import { CreateTripVars } from "@/app/hooks/useTripMutations";
import { CreateTripForm } from "./CreateTripForm";
import { TripCard } from "./TripCard";

interface Props {
  trips: Trip[];
  templates: Template[];
  selectedTripId: string | null | undefined;
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: (vars: CreateTripVars) => void;
  createTripPending: boolean;
  onDeleteTrip: (trip: Trip) => void;
}

export function TripSidebar({
  trips,
  templates,
  selectedTripId,
  onSelectTrip,
  onCreateTrip,
  createTripPending,
  onDeleteTrip,
}: Props) {
  const t = useTranslations("sidebar");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
          <div className="flex gap-3">
            <Link
              href="/templates"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {t("templates")}
            </Link>
            <Link
              href="/account"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {t("account")}
            </Link>
          </div>
        </div>
        <CreateTripForm
          templates={templates}
          onSubmit={onCreateTrip}
          isPending={createTripPending}
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 bg-gray-50">
        {trips.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            {t("noTrips")}
          </p>
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
