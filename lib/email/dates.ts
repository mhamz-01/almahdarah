// Date helpers for the email jobs. The academy runs on Pakistan time (UTC+5, no DST),
// so "today" and "this week" are decided there regardless of the server's own zone.
// Everything is plain "YYYY-MM-DD" strings so it is trivial to test.

import { addDays, weekStart } from "@/lib/task-plan";

export { addDays, weekStart };

export const PAKISTAN_OFFSET_HOURS = 5;

/** Today's date in Pakistan. */
export function pakistanToday(now: Date): string {
  return new Date(now.getTime() + PAKISTAN_OFFSET_HOURS * 3600_000).toISOString().slice(0, 10);
}

/** The calendar date (in Pakistan) of a stored timestamp. */
export function pakistanDateOf(timestamp: string): string {
  return pakistanToday(new Date(timestamp));
}

/** ISO weekday: 1 = Monday ... 7 = Sunday. */
export function isoWeekday(iso: string): number {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Monday and Sunday of the week before the one containing `todayIso`. */
export function previousWeek(todayIso: string): { start: string; end: string } {
  const start = addDays(weekStart(todayIso), -7);
  return { start, end: addDays(start, 6) };
}

/** Monday and Sunday of the week containing `todayIso`. */
export function currentWeek(todayIso: string): { start: string; end: string } {
  const start = weekStart(todayIso);
  return { start, end: addDays(start, 6) };
}
