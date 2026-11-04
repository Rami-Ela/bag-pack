"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Template, Trip } from "@/app/types/trips";
import { CreateTripVars } from "@/app/hooks/useTripMutations";
import { CreateTripForm } from "./CreateTripForm";
import { TripCard } from "./TripCard";
import { groupTripsByStatus, localToday } from "@/lib/trips/status";

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
  const { ongoing, upcoming, past } = groupTripsByStatus(trips, localToday());

  const renderCards = (list: Trip[]) =>
    list.map((trip) => (
      <TripCard
        key={trip.id}
        trip={trip}
        isSelected={selectedTripId === trip.id}
        onSelect={() => onSelectTrip(trip)}
        onDelete={() => onDeleteTrip(trip)}
      />
    ));

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
        {ongoing.length > 0 && (
          <section className="mb-2">
            <SectionTitle>{t("ongoing")}</SectionTitle>
            {renderCards(ongoing)}
          </section>
        )}
        {upcoming.length > 0 && (
          <section className="mb-2">
            <SectionTitle>{t("upcoming")}</SectionTitle>
            {renderCards(upcoming)}
          </section>
        )}
        {past.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer list-none px-1 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600">
              <span className="inline-block transition-transform group-open:rotate-90">
                ▸
              </span>{" "}
              {t("past", { count: past.length })}
            </summary>
            {renderCards(past)}
          </details>
        )}
      </nav>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </h2>
  );
}
