// Pure date + grouping helpers for the student's weekly task plan. Everything
// works on local "YYYY-MM-DD" strings (weeks run Monday–Sunday), so the same
// code is used by the UI and by the unit tests.

export interface PlannableTask {
  planned_date: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = ISO.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function toIso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12); // noon: immune to DST edges
}

export function addDays(iso: string, days: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** The Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  const day = parse(iso).getDay(); // 0 = Sunday
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

/** Monday → Sunday for the week starting at `start`. */
export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function dayName(iso: string): string {
  return DAY_LABELS[parse(iso).getDay()];
}

export function dayNumber(iso: string): number {
  return parse(iso).getDate();
}

/** "Fri 17 Oct" */
export function shortDate(iso: string): string {
  const d = parse(iso);
  return `${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

/** "13 – 19 Oct" or "27 Oct – 2 Nov" */
export function weekRangeLabel(start: string): string {
  const a = parse(start);
  const b = parse(addDays(start, 6));
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MONTH_LABELS[b.getMonth()]}`;
  return `${a.getDate()} ${MONTH_LABELS[a.getMonth()]} – ${b.getDate()} ${MONTH_LABELS[b.getMonth()]}`;
}

export type PlanState = "unplanned" | "done" | "missed" | "today" | "upcoming";

/** Where a task stands relative to the day the student planned it for. */
export function planState(task: Pick<PlannableTask, "planned_date" | "completed">, todayIso: string): PlanState {
  if (task.completed) return "done";
  if (!task.planned_date) return "unplanned";
  if (task.planned_date < todayIso) return "missed";
  if (task.planned_date === todayIso) return "today";
  return "upcoming";
}

export function tasksOnDay<T extends PlannableTask>(tasks: T[], iso: string): T[] {
  return tasks
    .filter((t) => t.planned_date === iso)
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.created_at.localeCompare(b.created_at));
}

/** Open tasks with no planned day, soonest due date first. */
export function unplannedTasks<T extends PlannableTask>(tasks: T[]): T[] {
  return tasks
    .filter((t) => !t.completed && !t.planned_date)
    .sort((a, b) => {
      if (a.due_date && b.due_date && a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
      if (!!a.due_date !== !!b.due_date) return a.due_date ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });
}

export interface WeekSummary {
  planned: number;
  done: number;
  missed: number;
  /** Whole-number percentage of planned tasks that are done; null when nothing is planned. */
  pct: number | null;
}

export function summarizeWeek(tasks: PlannableTask[], days: string[], todayIso: string): WeekSummary {
  const inWeek = tasks.filter((t) => t.planned_date !== null && days.includes(t.planned_date));
  const done = inWeek.filter((t) => t.completed).length;
  const missed = inWeek.filter((t) => planState(t, todayIso) === "missed").length;
  return { planned: inWeek.length, done, missed, pct: inWeek.length ? Math.round((done / inWeek.length) * 100) : null };
}

/** Table order: open tasks first, then by planned day, due date, newest. */
export function sortForTable<T extends PlannableTask>(tasks: T[]): T[] {
  const key = (v: string | null) => v ?? "9999-99-99";
  return [...tasks].sort(
    (a, b) =>
      Number(a.completed) - Number(b.completed) ||
      key(a.planned_date).localeCompare(key(b.planned_date)) ||
      key(a.due_date).localeCompare(key(b.due_date)) ||
      b.created_at.localeCompare(a.created_at),
  );
}

export interface PlanOption {
  value: string;
  label: string;
}

/** Choices for a "plan for…" picker: today + the next 13 days (plus the current value if outside). */
export function planOptions(todayIso: string, current: string | null): PlanOption[] {
  const options: PlanOption[] = Array.from({ length: 14 }, (_, i) => {
    const iso = addDays(todayIso, i);
    const prefix = i === 0 ? "Today" : i === 1 ? "Tomorrow" : null;
    return { value: iso, label: prefix ? `${prefix} · ${shortDate(iso)}` : shortDate(iso) };
  });
  if (current && !options.some((o) => o.value === current)) {
    options.unshift({ value: current, label: shortDate(current) });
  }
  return options;
}

export type OpenGroupKey = "missed" | "today" | "upcoming" | "unplanned";

export interface OpenGroup<T> {
  key: OpenGroupKey;
  label: string;
  tasks: T[];
}

const OPEN_GROUP_LABELS: Record<OpenGroupKey, string> = {
  missed: "Missed",
  today: "Today",
  upcoming: "Coming up",
  unplanned: "Not planned yet",
};

/** Open tasks split by planning state, in reading order; empty groups are dropped. */
export function groupOpenTasks<T extends PlannableTask>(tasks: T[], todayIso: string): OpenGroup<T>[] {
  const sorted = sortForTable(tasks.filter((t) => !t.completed));
  const keys: OpenGroupKey[] = ["missed", "today", "upcoming", "unplanned"];
  return keys
    .map((key) => ({
      key,
      label: OPEN_GROUP_LABELS[key],
      tasks: sorted.filter((t) => planState(t, todayIso) === key),
    }))
    .filter((g) => g.tasks.length > 0);
}

/** Number of pages for `total` items (always at least 1, so an empty list still has a "page 1"). */
export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/** `page` is 0-based and clamped into range, so a shrinking list never leaves you on a missing page. */
export function paginate<T>(items: T[], page: number, size: number): { page: number; pages: number; items: T[]; from: number; to: number } {
  const pages = pageCount(items.length, size);
  const safe = Math.min(Math.max(0, page), pages - 1);
  const slice = items.slice(safe * size, safe * size + size);
  return { page: safe, pages, items: slice, from: items.length ? safe * size + 1 : 0, to: safe * size + slice.length };
}
