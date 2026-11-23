/**
 * Month helpers for the release calendar. Months are "YYYY-MM" strings and
 * all date math is done in UTC so server and client always agree.
 */

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isMonth(value: string | undefined): value is string {
  return !!value && MONTH.test(value);
}

export function monthOf(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return monthOf(new Date(Date.UTC(y, m - 1 + delta, 1)));
}

export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** 0 = Sunday … 6 = Saturday. */
export function firstWeekday(month: string) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
}

export function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

export function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
