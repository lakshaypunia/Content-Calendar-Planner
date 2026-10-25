const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function toUtc(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

/** Adds whole days to a YYYY-MM-DD date in UTC and returns YYYY-MM-DD. */
export function addDays(isoDate: string, days: number): string {
  return new Date(toUtc(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}

export function weekdayOf(isoDate: string): (typeof WEEKDAYS)[number] {
  return WEEKDAYS[new Date(toUtc(isoDate)).getUTCDay()];
}

export function isWeekend(isoDate: string): boolean {
  const day = new Date(toUtc(isoDate)).getUTCDay();
  return day === 0 || day === 6;
}
