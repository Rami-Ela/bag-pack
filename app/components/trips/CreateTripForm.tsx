"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TripType } from "@/app/types/trips";
import { CreateTripVars } from "@/app/hooks/useTripMutations";
import { TripTypePicker } from "./TripTypePicker";
import { DatePicker } from "@/app/components/ui/date-picker";

interface Props {
  onSubmit: (vars: CreateTripVars) => void;
  isPending: boolean;
}

export function CreateTripForm({ onSubmit, isPending }: Props) {
  const t = useTranslations("createTripForm");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("OTHER");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name,
      destination: destination || null,
      tripType,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    setName("");
    setDestination("");
    setTripType("OTHER");
    setStartDate("");
    setEndDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
        required
      />
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder={t("destinationPlaceholder")}
        className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
      />

      <TripTypePicker value={tripType} onChange={setTripType} />

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1.5 pl-1">{t("startDate")}</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Sélectionner"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1.5 pl-1">{t("endDate")}</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              placeholder="Sélectionner"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {t("submit")}
      </button>
    </form>
  );
}
