// Loads everything the streak needs besides attendance: the timetable, per-date
// cancellations, linked recordings and the student's progress on those
// recordings. Server-only (service role).

import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { LINK_LOOKBACK_DAYS, resolveRecordingLinks } from "@/lib/recordings-match";
import { addDaysIso, computeStudentStats, mondayOf, type RecordingInfo, type StreakContext } from "@/lib/students";
import type {
  AttendanceRow,
  ClassCancellationRow,
  ClassRecordingRow,
  ClassScheduleRow,
  CourseLessonRow,
  CourseRow,
  LessonProgressRow,
  StudentRow,
  StudentWithStats,
} from "@/lib/types";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

export type RecordingLesson = Pick<CourseLessonRow, "id" | "course_id" | "position" | "title" | "youtube_video_id" | "duration_seconds">;

export interface ClassCalendar {
  schedule: ClassScheduleRow[];
  cancellations: ClassCancellationRow[];
  recordings: ClassRecordingRow[];
  lessons: Map<number, RecordingLesson>;
  /** Dates the admin marked "no recording" (automatic linking skips them). */
  noRecordingDates: Set<string>;
}

/**
 * Timetable, cancellations and recordings from `sinceIso` on. Missing tables (migration not run) read as empty.
 * For the week in progress, a class's recording is the latest video of its course added since the class
 * (uploads are often a day or two late); see resolveCurrentWeekRecordings.
 */
export async function loadClassCalendar(supabase: Admin, sinceIso: string, now = new Date()): Promise<ClassCalendar> {
  const todayIso = now.toISOString().slice(0, 10);
  const monday = mondayOf(todayIso);
  // Recordings are also worked out here (not only by the nightly sync), so look back as far as the sync does.
  const lookback = addDaysIso(todayIso, -LINK_LOOKBACK_DAYS);
  const from = [sinceIso, monday, lookback].sort()[0];
  const [scheduleRes, cancelRes, recRes, coursesRes, recentLessonsRes] = await Promise.all([
    supabase.from("class_schedule").select("*").order("sort_order", { ascending: true }),
    supabase.from("class_cancellations").select("*").gte("class_date", from),
    supabase.from("class_recordings").select("*").gte("class_date", from),
    supabase.from("courses").select("id, title"),
    supabase.from("course_lessons").select("id, course_id, position, created_at").gte("created_at", `${lookback < monday ? lookback : monday}T00:00:00Z`),
  ]);
  const schedule = ((scheduleRes.data as ClassScheduleRow[] | null) ?? []).map((s) => ({
    ...s,
    active_from: s.active_from ?? "2000-01-01",
    course_id: s.course_id ?? null,
  }));
  const cancellations = (cancelRes.data as ClassCancellationRow[] | null) ?? [];
  // A row with no lesson is the admin saying "no recording": it blocks automatic
  // linking for that date but isn't a recording itself.
  const storedRaw = (recRes.data as (Omit<ClassRecordingRow, "lesson_id"> & { lesson_id: number | null })[] | null) ?? [];
  const stored = storedRaw.filter((r): r is ClassRecordingRow => r.lesson_id !== null);

  const { thisWeek: latestThisWeek, older } = resolveRecordingLinks({
    schedule,
    courses: (coursesRes.data as Pick<CourseRow, "id" | "title">[] | null) ?? [],
    cancelledDates: new Set(cancellations.map((c) => c.class_date)),
    existing: storedRaw.map((r) => ({ class_date: r.class_date, lesson_id: r.lesson_id ?? 0, source: r.source })),
    lessons: (recentLessonsRes.data as { id: number; course_id: number; position: number; created_at: string }[] | null) ?? [],
    todayIso,
  });
  const byDate = new Map(stored.map((r) => [r.class_date, r]));
  // Older classes the nightly sync hasn't linked yet: show the recording it will link.
  for (const p of older) {
    if (byDate.has(p.class_date) || p.class_date < sinceIso) continue;
    byDate.set(p.class_date, { id: 0, class_date: p.class_date, schedule_id: p.schedule_id, lesson_id: p.lesson_id, source: "auto", linked_at: p.addedAt, notified_at: null });
  }
  for (const [date, pick] of latestThisWeek) {
    const existing = byDate.get(date);
    if (existing?.lesson_id === pick.lessonId) continue;
    byDate.set(date, {
      id: existing?.id ?? 0,
      class_date: date,
      schedule_id: pick.scheduleId,
      lesson_id: pick.lessonId,
      source: "auto",
      linked_at: pick.addedAt,
      notified_at: existing?.notified_at ?? null,
    });
  }
  const recordings = [...byDate.values()];

  const lessonIds = [...new Set(recordings.map((r) => r.lesson_id))];
  const lessonsRes = lessonIds.length
    ? await supabase.from("course_lessons").select("id, course_id, position, title, youtube_video_id, duration_seconds").in("id", lessonIds)
    : { data: [] };
  const lessons = new Map(
    ((lessonsRes.data as RecordingLesson[] | null) ?? []).map((l) => [l.id, l]),
  );

  const noRecordingDates = new Set(storedRaw.filter((r) => r.lesson_id === null).map((r) => r.class_date));
  return { schedule, cancellations, recordings, lessons, noRecordingDates };
}

/** Progress rows for the calendar's recordings: one student, or many (admin, emails). */
export async function loadRecordingProgress(supabase: Admin, calendar: ClassCalendar, studentIds?: number[]): Promise<LessonProgressRow[]> {
  const lessonIds = [...calendar.lessons.keys()];
  if (!lessonIds.length) return [];
  let query = supabase.from("lesson_progress").select("*").in("lesson_id", lessonIds);
  if (studentIds) query = query.in("student_id", studentIds);
  const { data } = await query;
  return (data as LessonProgressRow[] | null) ?? [];
}

/** The streak context for one student, from a shared calendar and their progress rows. */
export function streakContextFor(calendar: ClassCalendar, progress: LessonProgressRow[]): StreakContext {
  const recordings = new Map<string, RecordingInfo>();
  for (const r of calendar.recordings) {
    const l = calendar.lessons.get(r.lesson_id);
    recordings.set(r.class_date, {
      lessonId: r.lesson_id,
      linkedAt: r.linked_at,
      lesson: l
        ? { courseId: l.course_id, position: l.position, title: l.title, videoId: l.youtube_video_id, durationSeconds: l.duration_seconds }
        : null,
    });
  }
  return {
    schedule: calendar.schedule,
    cancelledDates: new Set(calendar.cancellations.map((c) => c.class_date)),
    recordings,
    progress: new Map(
      progress.map((p) => [
        p.lesson_id,
        { completedAt: p.completed ? (p.completed_at ?? p.updated_at) : null, positionSeconds: p.last_position_seconds },
      ]),
    ),
  };
}

/** Convenience for student pages: calendar + this student's recording progress. */
export async function loadStudentStreakContext(supabase: Admin, studentId: number, joinedAt: string) {
  const calendar = await loadClassCalendar(supabase, joinedAt.slice(0, 10));
  const progress = await loadRecordingProgress(supabase, calendar, [studentId]);
  return { calendar, ctx: streakContextFor(calendar, progress) };
}

const PAGE = 1000;

/** Streak stats for many students at once (admin list, emails). */
export async function computeStatsForStudents<S extends StudentRow>(
  supabase: Admin,
  students: S[],
  now: Date,
): Promise<{ calendar: ClassCalendar; stats: Map<number, StudentWithStats> }> {
  const stats = new Map<number, StudentWithStats>();
  if (!students.length) return { calendar: await loadClassCalendar(supabase, now.toISOString().slice(0, 10)), stats };

  const since = students.reduce((min, s) => (s.created_at.slice(0, 10) < min ? s.created_at.slice(0, 10) : min), "9999-12-31");
  const ids = students.map((s) => s.id);
  const calendar = await loadClassCalendar(supabase, since);

  const attendance: AttendanceRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in("student_id", ids)
      .gte("class_date", since)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    attendance.push(...((data ?? []) as AttendanceRow[]));
    if (!data || data.length < PAGE) break;
  }
  const progress = await loadRecordingProgress(supabase, calendar, ids);

  for (const student of students) {
    const ctx = streakContextFor(
      calendar,
      progress.filter((p) => p.student_id === student.id),
    );
    stats.set(student.id, computeStudentStats(student, attendance.filter((a) => a.student_id === student.id), now, ctx));
  }
  return { calendar, stats };
}
