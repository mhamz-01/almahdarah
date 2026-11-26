// Pure rules for linking a held class to its recording (no I/O, safe anywhere).
// See lib/recordings.ts for when they run.

import { addDaysIso, mondayOf, slotOn } from "@/lib/students";
import type { ClassRecordingRow, ClassScheduleRow, CourseRow } from "@/lib/types";

/** How far back a class can still be given a recording automatically. */
export const LINK_LOOKBACK_DAYS = 14;

// ── Matching a class to a course ─────────────────────────────────────────────

const STOP_WORDS = new Set(["al", "an", "ar", "as", "at", "ad", "the", "of", "and", "course", "class", "wa", "fil", "ul", "un"]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

/** The course whose title shares the most words with the class name; null when none or a tie. */
export function guessCourseId(subject: string, courses: Pick<CourseRow, "id" | "title">[]): number | null {
  const wanted = new Set(tokens(subject));
  if (!wanted.size) return null;
  let best: number | null = null;
  let bestScore = 0;
  let tie = false;
  for (const c of courses) {
    const score = new Set(tokens(c.title).filter((t) => wanted.has(t))).size;
    if (score > bestScore) {
      best = c.id;
      bestScore = score;
      tie = false;
    } else if (score === bestScore && score > 0) {
      tie = true;
    }
  }
  return bestScore > 0 && !tie ? best : null;
}

export function courseIdForSlot(slot: Pick<ClassScheduleRow, "course_id" | "subject">, courses: Pick<CourseRow, "id" | "title">[]): number | null {
  return slot.course_id ?? guessCourseId(slot.subject, courses);
}

// ── Planning the links (pure) ────────────────────────────────────────────────

export interface LinkPlanInput {
  schedule: Pick<ClassScheduleRow, "id" | "day" | "subject" | "active_from" | "course_id">[];
  courses: Pick<CourseRow, "id" | "title">[];
  cancelledDates: Set<string>;
  existing: Pick<ClassRecordingRow, "class_date" | "lesson_id">[];
  lessons: { id: number; course_id: number; position: number; created_at: string }[];
  todayIso: string;
  lookbackDays?: number;
}

export interface PlannedLink {
  class_date: string;
  schedule_id: number;
  lesson_id: number;
}

export function planRecordingLinks(input: LinkPlanInput): PlannedLink[] {
  const linkedDates = new Set(input.existing.map((r) => r.class_date));
  const usedLessons = new Set(input.existing.map((r) => r.lesson_id));
  const from = addDaysIso(input.todayIso, -(input.lookbackDays ?? LINK_LOOKBACK_DAYS));

  // Held, unlinked classes per course, oldest first.
  const datesByCourse = new Map<number, { iso: string; scheduleId: number }[]>();
  for (let iso = from; iso <= input.todayIso; iso = addDaysIso(iso, 1)) {
    if (linkedDates.has(iso) || input.cancelledDates.has(iso)) continue;
    const slot = slotOn(input.schedule, iso);
    if (!slot) continue;
    const courseId = courseIdForSlot(slot, input.courses);
    if (courseId === null) continue;
    const list = datesByCourse.get(courseId) ?? [];
    list.push({ iso, scheduleId: slot.id });
    datesByCourse.set(courseId, list);
  }

  // Lessons arrive in nightly batches. Each batch belongs to the most recent
  // unlinked classes on or before the day it was added: one new lesson goes to
  // the latest class, three new lessons to the latest three (in order). A class
  // whose recording was never uploaded is skipped instead of shifting every
  // later recording onto the wrong date.
  const plan: PlannedLink[] = [];
  for (const [courseId, dates] of datesByCourse) {
    const batches = new Map<string, LinkPlanInput["lessons"]>();
    for (const l of input.lessons) {
      const day = l.created_at.slice(0, 10);
      if (l.course_id !== courseId || usedLessons.has(l.id) || day < from) continue;
      batches.set(day, [...(batches.get(day) ?? []), l]);
    }
    const taken = new Set<string>();
    for (const day of [...batches.keys()].sort()) {
      const lessons = batches.get(day)!.sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
      const open = dates.filter((d) => d.iso <= day && !taken.has(d.iso));
      const targets = open.slice(-lessons.length);
      const matched = lessons.slice(lessons.length - targets.length);
      targets.forEach((d, i) => {
        taken.add(d.iso);
        plan.push({ class_date: d.iso, schedule_id: d.scheduleId, lesson_id: matched[i].id });
      });
    }
  }
  return plan.sort((a, b) => a.class_date.localeCompare(b.class_date));
}


// ── Current week: late uploads ───────────────────────────────────────────────
// Videos often reach YouTube a day or two after the class, so the nightly sync
// may only see them later. For the week in progress, a held class's recording is
// simply the latest video of its course added since that class (and before the
// course's next class that week, which would be that class's own recording).
// A link chosen by the admin always wins.

export interface CurrentWeekInput {
  schedule: Pick<ClassScheduleRow, "id" | "day" | "subject" | "active_from" | "course_id">[];
  courses: Pick<CourseRow, "id" | "title">[];
  cancelledDates: Set<string>;
  adminLinkedDates: Set<string>;
  lessons: { id: number; course_id: number; position: number; created_at: string }[];
  todayIso: string;
}

export function resolveCurrentWeekRecordings(input: CurrentWeekInput): Map<string, { lessonId: number; scheduleId: number; addedAt: string }> {
  const monday = mondayOf(input.todayIso);
  const held: { iso: string; scheduleId: number; courseId: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const iso = addDaysIso(monday, i);
    if (iso > input.todayIso || input.cancelledDates.has(iso)) continue;
    const slot = slotOn(input.schedule, iso);
    const courseId = slot ? courseIdForSlot(slot, input.courses) : null;
    if (slot && courseId !== null) held.push({ iso, scheduleId: slot.id, courseId });
  }

  const out = new Map<string, { lessonId: number; scheduleId: number; addedAt: string }>();
  for (const h of held) {
    if (input.adminLinkedDates.has(h.iso)) continue;
    // The same course's next class this week (held or still to come) closes the window.
    let next: string | null = null;
    for (let d = addDaysIso(h.iso, 1); d < addDaysIso(monday, 5); d = addDaysIso(d, 1)) {
      const slot = slotOn(input.schedule, d);
      if (slot && !input.cancelledDates.has(d) && courseIdForSlot(slot, input.courses) === h.courseId) {
        next = d;
        break;
      }
    }
    const latest = input.lessons
      .filter((l) => {
        const day = l.created_at.slice(0, 10);
        return l.course_id === h.courseId && day >= h.iso && (next === null || day < next);
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.position - a.position)[0];
    if (latest) out.set(h.iso, { lessonId: latest.id, scheduleId: h.scheduleId, addedAt: latest.created_at });
  }
  return out;
}

// ── Both rules together ──────────────────────────────────────────────────────
// Used by the nightly sync (to store links) and by every page that shows the
// streak (so a recording shows up even before the sync has stored its link).

export interface RecordingResolution {
  /** This week's pick for each held class (late uploads included). */
  thisWeek: ReturnType<typeof resolveCurrentWeekRecordings>;
  /** Links for older, still-unlinked classes within the lookback window. */
  older: (PlannedLink & { addedAt: string })[];
}

export function resolveRecordingLinks(
  input: Omit<CurrentWeekInput, "adminLinkedDates"> & {
    existing: Pick<ClassRecordingRow, "class_date" | "lesson_id" | "source">[];
    lookbackDays?: number;
  },
): RecordingResolution {
  const thisWeek = resolveCurrentWeekRecordings({
    ...input,
    adminLinkedDates: new Set(input.existing.filter((r) => r.source === "admin").map((r) => r.class_date)),
  });
  const claimed = new Set([...thisWeek.values()].map((p) => p.lessonId));
  const addedAt = new Map(input.lessons.map((l) => [l.id, l.created_at]));
  const older = planRecordingLinks({
    schedule: input.schedule,
    courses: input.courses,
    cancelledDates: input.cancelledDates,
    existing: [...input.existing, ...[...thisWeek].map(([d, p]) => ({ class_date: d, lesson_id: p.lessonId }))],
    lessons: input.lessons.filter((l) => !claimed.has(l.id)),
    todayIso: input.todayIso,
    lookbackDays: input.lookbackDays,
  }).map((p) => ({ ...p, addedAt: addedAt.get(p.lesson_id)! }));
  return { thisWeek, older };
}
