import { CANCEL_REASONS, type CancelReason, type ClassScheduleInsert, type ClassScheduleUpdate, type Weekday } from "@/lib/types";

const DAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const NOTE_MAX_LENGTH = 400;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_COLOR = "#1182A3";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ScheduleValidationResult =
  | { ok: true; value: Required<ClassScheduleUpdate> }
  | { ok: false; error: string };

function courseIdFrom(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function validateSchedulePayload(body: unknown): ScheduleValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  if (typeof b.subject !== "string" || !b.subject.trim()) {
    return { ok: false, error: "Class / subject is required" };
  }
  if (typeof b.start_time !== "string" || !b.start_time.trim()) {
    return { ok: false, error: "Start time is required" };
  }
  if (typeof b.duration !== "string" || !b.duration.trim()) {
    return { ok: false, error: "Duration is required" };
  }
  if (typeof b.teacher !== "string" || !b.teacher.trim()) {
    return { ok: false, error: "Teacher is required" };
  }
  const note = b.note === undefined ? "" : b.note;
  if (typeof note !== "string") return { ok: false, error: "Invalid note" };
  if (note.trim().length > NOTE_MAX_LENGTH) {
    return { ok: false, error: `Note must be ${NOTE_MAX_LENGTH} characters or fewer` };
  }
  const course_id = courseIdFrom(b.course_id);
  if (course_id === undefined) return { ok: false, error: "Choose a valid course" };

  return {
    ok: true,
    value: {
      subject: b.subject.trim(),
      start_time: b.start_time.trim(),
      duration: b.duration.trim(),
      teacher: b.teacher.trim(),
      note: note.trim(),
      course_id,
    },
  };
}

export type ScheduleCreateValidationResult =
  | { ok: true; value: ClassScheduleInsert }
  | { ok: false; error: string };

export function validateScheduleCreatePayload(body: unknown): ScheduleCreateValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  if (typeof b.day !== "string" || !DAYS.includes(b.day as Weekday)) {
    return { ok: false, error: "Choose a valid day" };
  }

  const rest = validateSchedulePayload(body);
  if (!rest.ok) return rest;

  const color = typeof b.color === "string" && COLOR_PATTERN.test(b.color) ? b.color : DEFAULT_COLOR;

  return { ok: true, value: { day: b.day as Weekday, color, ...rest.value } };
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export type CancellationValidationResult =
  | { ok: true; value: { class_date: string; reason: CancelReason; note: string; notify: boolean } }
  | { ok: false; error: string };

export function validateCancellationPayload(body: unknown): CancellationValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;
  if (!isIsoDate(b.date)) return { ok: false, error: "Choose a valid date" };
  const reason = (b.reason ?? "Teacher unavailable") as CancelReason;
  if (!CANCEL_REASONS.includes(reason)) return { ok: false, error: "Choose a reason" };
  const note = b.note === undefined ? "" : b.note;
  if (typeof note !== "string") return { ok: false, error: "Invalid note" };
  if (note.trim().length > NOTE_MAX_LENGTH) return { ok: false, error: `Note must be ${NOTE_MAX_LENGTH} characters or fewer` };
  return { ok: true, value: { class_date: b.date, reason, note: note.trim(), notify: b.notify !== false } };
}
