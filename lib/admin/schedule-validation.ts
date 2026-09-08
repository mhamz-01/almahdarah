import type { ClassScheduleInsert, ClassScheduleUpdate, SlotStatus, Weekday } from "@/lib/types";

const STATUSES: SlotStatus[] = ["scheduled", "cancelled", "rescheduled"];
const DAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const NOTE_MAX_LENGTH = 400;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_COLOR = "#1182A3";

export type ScheduleValidationResult =
  | { ok: true; value: Required<ClassScheduleUpdate> }
  | { ok: false; error: string };

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
  if (typeof b.status !== "string" || !STATUSES.includes(b.status as SlotStatus)) {
    return { ok: false, error: "Choose a valid status" };
  }
  if (typeof b.note !== "string") return { ok: false, error: "Invalid note" };
  if (b.note.trim().length > NOTE_MAX_LENGTH) {
    return { ok: false, error: `Note must be ${NOTE_MAX_LENGTH} characters or fewer` };
  }

  return {
    ok: true,
    value: {
      subject: b.subject.trim(),
      start_time: b.start_time.trim(),
      duration: b.duration.trim(),
      teacher: b.teacher.trim(),
      status: b.status as SlotStatus,
      note: b.note.trim(),
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
