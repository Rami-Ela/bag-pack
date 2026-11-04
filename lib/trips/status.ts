export type TripStatus = "ongoing" | "upcoming" | "past";

interface DatedTrip {
  startDate: string | null;
  endDate: string | null;
}

// Dates are stored as UTC midnight of the picked day, so the calendar day is the ISO prefix.
function toDay(date: string | null): string | null {
  return date ? date.slice(0, 10) : null;
}

export function localToday(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// A single known date stands for both ends; an undated trip is still being planned, hence upcoming.
export function getTripStatus(trip: DatedTrip, today: string): TripStatus {
  const start = toDay(trip.startDate) ?? toDay(trip.endDate);
  const end = toDay(trip.endDate) ?? start;
  if (!start || !end) return "upcoming";
  if (end < today) return "past";
  if (start > today) return "upcoming";
  return "ongoing";
}

export function groupTripsByStatus<T extends DatedTrip>(
  trips: T[],
  today: string,
): Record<TripStatus, T[]> {
  const groups: Record<TripStatus, T[]> = {
    ongoing: [],
    upcoming: [],
    past: [],
  };
  for (const trip of trips) groups[getTripStatus(trip, today)].push(trip);

  // Soonest departure first, undated trips last; most recently finished first.
  const byStart = (a: T, b: T) =>
    (toDay(a.startDate) ?? "9999").localeCompare(toDay(b.startDate) ?? "9999");
  groups.ongoing.sort(byStart);
  groups.upcoming.sort(byStart);
  groups.past.sort((a, b) =>
    (toDay(b.endDate) ?? toDay(b.startDate) ?? "").localeCompare(
      toDay(a.endDate) ?? toDay(a.startDate) ?? "",
    ),
  );
  return groups;
}
