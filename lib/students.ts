import type {
  AttendanceCell,
  AttendanceRow,
  AttendanceWeek,
  CatchUpItem,
  ClassScheduleRow,
  DayStatus,
  Milestone,
  StudentRow,
  StudentWithStats,
  Weekday,
  WeekOutcome,
} from "@/lib/types";

// ── Rules ────────────────────────────────────────────────────────────────────
// A week's target is the classes that were actually held: what is on the
// timetable that week, minus dates the admin cancelled, from the day the
// student joined. Attend all of them (or catch up on a missed one by watching
// its recording) and the streak grows by one. A week with nothing held pauses
// the streak. A miss only becomes final once its catch-up window has closed.

/** Days a student has to finish a missed class's recording, counted from when it is linked. */
export const CATCH_UP_DAYS = 7;
/** Days a missed class waits for its recording. After that, with no recording, it counts as missed. */
export const RECORDING_WAIT_DAYS = 7;

export const MILESTONES: Milestone[] = [
  { weeks: 4, name: "First month" },
  { weeks: 8, name: "Steadfast" },
  { weeks: 12, name: "A full term" },
  { weeks: 26, name: "Half a year" },
];

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DISPLAY_WEEKS = 5;
const MAX_TRACKED_WEEKS = 104;

// ── What the calculation needs besides attendance ───────────────────────────

export interface RecordingInfo {
  lessonId: number;
  /** When the recording was linked to the class (timestamp). */
  linkedAt: string;
  lesson: { courseId: number; position: number; title: string; videoId: string; durationSeconds: number | null } | null;
}

export interface LessonProgressInfo {
  completedAt: string | null;
  positionSeconds: number;
}

export interface StreakContext {
  schedule: Pick<ClassScheduleRow, "day" | "subject" | "active_from">[];
  /** Cancelled class dates (YYYY-MM-DD). */
  cancelledDates: Set<string>;
  /** Linked recordings by class date. */
  recordings: Map<string, RecordingInfo>;
  /** This student's progress on lessons, by lesson id. */
  progress: Map<number, LessonProgressInfo>;
}

export const EMPTY_STREAK_CONTEXT: StreakContext = {
  schedule: [],
  cancelledDates: new Set(),
  recordings: new Map(),
  progress: new Map(),
};

// ── Dates (UTC calendar days, like the rest of the portal) ─────────────────

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

/** Monday of the week containing `iso`. */
export function mondayOf(iso: string): string {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return addDaysIso(iso, day === 0 ? -6 : 1 - day);
}

export function weekdayOf(iso: string): Weekday | null {
  return WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay() - 1] ?? null;
}

function formatWeekRange(monday: string): string {
  const mon = new Date(`${monday}T00:00:00Z`);
  const fri = new Date(`${addDaysIso(monday, 4)}T00:00:00Z`);
  if (mon.getUTCMonth() === fri.getUTCMonth()) {
    return `${mon.getUTCDate()}–${fri.getUTCDate()} ${MONTH_ABBR[fri.getUTCMonth()]}`;
  }
  return `${mon.getUTCDate()} ${MONTH_ABBR[mon.getUTCMonth()]} – ${fri.getUTCDate()} ${MONTH_ABBR[fri.getUTCMonth()]}`;
}

/** The timetable row that applies to a weekday on a given date, if any. */
export function slotOn<T extends Pick<ClassScheduleRow, "day" | "active_from">>(schedule: T[], iso: string): T | null {
  const day = weekdayOf(iso);
  if (!day) return null;
  return schedule.find((s) => s.day === day && (s.active_from ?? "2000-01-01") <= iso) ?? null;
}

// ── One missed class ─────────────────────────────────────────────────────────

interface MissResolution {
  status: Extract<DayStatus, "caught_up" | "catch_up" | "absent">;
  item: Omit<CatchUpItem, "day" | "subject"> | null;
}

function resolveMiss(iso: string, todayIso: string, ctx: StreakContext): MissResolution {
  const rec = ctx.recordings.get(iso);
  if (!rec) {
    const deadline = addDaysIso(iso, RECORDING_WAIT_DAYS);
    if (todayIso > deadline) return { status: "absent", item: null };
    return {
      status: "catch_up",
      item: { date: iso, state: "waiting", deadline, lesson: null, watchedSeconds: 0, durationSeconds: null },
    };
  }

  const linkedIso = rec.linkedAt.slice(0, 10);
  const deadline = addDaysIso(linkedIso > iso ? linkedIso : iso, CATCH_UP_DAYS);
  const progress = ctx.progress.get(rec.lessonId);
  const lesson = rec.lesson
    ? { id: rec.lessonId, courseId: rec.lesson.courseId, position: rec.lesson.position, title: rec.lesson.title, videoId: rec.lesson.videoId }
    : null;
  const durationSeconds = rec.lesson?.durationSeconds ?? null;
  const completedOn = progress?.completedAt?.slice(0, 10) ?? null;

  if (completedOn && completedOn <= deadline) {
    // Finished catch-ups stay visible for a week so the student sees "streak saved".
    const showUntil = addDaysIso(completedOn, 7);
    return {
      status: "caught_up",
      item:
        todayIso <= showUntil
          ? { date: iso, state: "done", deadline, lesson, watchedSeconds: durationSeconds ?? 0, durationSeconds }
          : null,
    };
  }
  if (todayIso > deadline) return { status: "absent", item: null };
  return {
    status: "catch_up",
    item: { date: iso, state: "ready", deadline, lesson, watchedSeconds: progress?.positionSeconds ?? 0, durationSeconds },
  };
}

// ── Whole record ─────────────────────────────────────────────────────────────

const COUNTED: DayStatus[] = ["present", "caught_up", "catch_up", "absent", "upcoming"];

function outcomeOf(cells: AttendanceCell[], isCurrentWeek: boolean): WeekOutcome {
  if (cells.some((c) => c.status === "absent")) return "missed";
  const target = cells.filter((c) => COUNTED.includes(c.status)).length;
  if (target === 0) return "paused";
  // A past week whose only gap is an open catch-up counts for now (the streak shows "at risk").
  if (!isCurrentWeek) return "perfect";
  const open = cells.some((c) => c.status === "upcoming" || c.status === "catch_up");
  return open ? "in_progress" : "perfect";
}

export function computeStudentStats(
  student: StudentRow,
  attendance: AttendanceRow[],
  referenceDate: Date,
  ctx: StreakContext = EMPTY_STREAK_CONTEXT,
): StudentWithStats {
  const presentDates = new Set(attendance.filter((a) => a.status === "present").map((a) => a.class_date));
  const todayIso = toIsoDate(referenceDate);
  const joinIso = student.created_at.slice(0, 10);
  const currentMonday = mondayOf(todayIso);
  const joinMonday = mondayOf(joinIso);

  // Oldest week first, from the week they joined (or two years back at most).
  const mondays: string[] = [];
  for (let i = 0; i < MAX_TRACKED_WEEKS; i++) {
    const monday = addDaysIso(currentMonday, -7 * i);
    if (monday < joinMonday) break;
    mondays.unshift(monday);
  }
  if (!mondays.length) mondays.push(currentMonday);

  const catchUps: CatchUpItem[] = [];
  const allWeeks: AttendanceWeek[] = mondays.map((monday) => {
    const isCurrentWeek = monday === currentMonday;
    const cells: AttendanceCell[] = WEEKDAYS.map((day, i) => {
      const iso = addDaysIso(monday, i);
      const slot = slotOn(ctx.schedule, iso);
      let status: DayStatus;
      if (iso < joinIso) status = "before_join";
      else if (presentDates.has(iso)) status = "present";
      else if (!slot) status = "no_class";
      else if (ctx.cancelledDates.has(iso)) status = "cancelled";
      else if (iso >= todayIso) status = "upcoming";
      else {
        const miss = resolveMiss(iso, todayIso, ctx);
        status = miss.status;
        if (miss.item) catchUps.push({ ...miss.item, day, subject: slot.subject });
      }
      return { day, date: iso, status };
    });
    return {
      range: isCurrentWeek ? "This week" : formatWeekRange(monday),
      startDate: monday,
      cells,
      target: cells.filter((c) => COUNTED.includes(c.status)).length,
      attended: cells.filter((c) => c.status === "present" || c.status === "caught_up").length,
      outcome: outcomeOf(cells, isCurrentWeek),
    };
  });

  let run = 0;
  let bestStreak = 0;
  let perfectWeeks = 0;
  let attendedTotal = 0;
  let missedTotal = 0;
  for (const week of allWeeks) {
    attendedTotal += week.attended;
    missedTotal += week.cells.filter((c) => c.status === "absent").length;
    if (week.outcome === "perfect") {
      run++;
      perfectWeeks++;
      bestStreak = Math.max(bestStreak, run);
    } else if (week.outcome === "missed") {
      run = 0;
    }
  }
  const streak = run;

  const weeks = [...allWeeks].reverse().slice(0, DISPLAY_WEEKS);
  const thisWeek = weeks[0];

  let lastMissed = "never";
  for (const w of [...allWeeks].reverse()) {
    const missed = [...w.cells].reverse().find((c) => c.status === "absent");
    if (missed) {
      lastMissed = `${w.range} · ${missed.day.slice(0, 3)}`;
      break;
    }
  }

  const counted = attendedTotal + missedTotal;
  const openCatchUps = catchUps.filter((c) => c.state !== "done");

  return {
    ...student,
    streak,
    bestStreak,
    perfectWeeks,
    missedTotal,
    attendedThisWeek: thisWeek.attended,
    targetThisWeek: thisWeek.target,
    atRisk: streak > 0 && openCatchUps.length > 0,
    attendanceRate: counted ? Math.round((attendedTotal / counted) * 100) : null,
    lastMissed,
    weeks,
    catchUps: catchUps.sort((a, b) => a.date.localeCompare(b.date)),
    earnedMilestones: MILESTONES.filter((m) => bestStreak >= m.weeks),
    nextMilestone: MILESTONES.find((m) => m.weeks > streak) ?? null,
  };
}
