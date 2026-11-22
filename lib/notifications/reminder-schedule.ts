// Reminders are computed for a single household time zone; per-user zones are out of scope.
export const REMINDER_TIME_ZONE = "Europe/Paris";

// Calendar day (YYYY-MM-DD) of `now` as seen in the given time zone.
export function dayInTimeZone(
  now: Date,
  timeZone: string = REMINDER_TIME_ZONE,
): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Trip dates are stored as UTC midnight of the picked day (see lib/trips/status.ts), so
// "departing tomorrow" means startDate equals UTC midnight of tomorrow's local calendar day.
export function tomorrowStartDate(now: Date): Date {
  const date = new Date(`${dayInTimeZone(now)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
