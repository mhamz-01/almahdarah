// Server-side loading for the admin schedule page and the dashboard's "Today's class" card.

import { loadClassCalendar } from "@/lib/class-calendar";
import { buildAdminDays, type AdminClassDay } from "@/lib/admin/schedule-week";
import { guessCourseId } from "@/lib/recordings-match";
import { addDaysIso, mondayOf } from "@/lib/students";
import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ClassScheduleRow, CourseLessonRow, CourseRow } from "@/lib/types";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

export interface AdminScheduleData {
  schedule: ClassScheduleRow[];
  courses: Pick<CourseRow, "id" | "title">[];
  guessedCourse: Record<number, number | null>;
  days: AdminClassDay[];
  mondays: string[];
  currentMonday: string;
  todayIso: string;
  lessonsByCourse: Record<number, { id: number; title: string; position: number }[]>;
  error: string | null;
}

const LESSON_OPTIONS = 15;

export async function loadAdminSchedule(supabase: Admin, now: Date, weeksBack = 5, weeksAhead = 8): Promise<AdminScheduleData> {
  const todayIso = now.toISOString().slice(0, 10);
  const currentMonday = mondayOf(todayIso);
  const fromMonday = addDaysIso(currentMonday, -7 * weeksBack);
  const weeks = weeksBack + 1 + weeksAhead;
  const mondays = Array.from({ length: weeks }, (_, i) => addDaysIso(fromMonday, 7 * i));
  const toIso = addDaysIso(fromMonday, 7 * weeks);

  const [calendar, coursesRes, attendanceRes, studentsRes, lessonsRes] = await Promise.all([
    loadClassCalendar(supabase, fromMonday),
    supabase.from("courses").select("id, title").order("sort_order", { ascending: true }),
    supabase.from("attendance").select("class_date").eq("status", "present").gte("class_date", fromMonday).lt("class_date", toIso).limit(5000),
    supabase.from("students").select("created_at"),
    supabase
      .from("course_lessons")
      .select("id, course_id, title, position, created_at")
      .order("created_at", { ascending: false })
      .order("position", { ascending: false })
      .limit(400),
  ]);

  const courses = (coursesRes.data as Pick<CourseRow, "id" | "title">[] | null) ?? [];
  const presentByDate = new Map<string, number>();
  for (const row of (attendanceRes.data as { class_date: string }[] | null) ?? []) {
    presentByDate.set(row.class_date, (presentByDate.get(row.class_date) ?? 0) + 1);
  }

  const lessonsByCourse: AdminScheduleData["lessonsByCourse"] = {};
  for (const l of (lessonsRes.data as Pick<CourseLessonRow, "id" | "course_id" | "title" | "position">[] | null) ?? []) {
    const list = (lessonsByCourse[l.course_id] ??= []);
    if (list.length < LESSON_OPTIONS) list.push({ id: l.id, title: l.title, position: l.position });
  }

  const days = buildAdminDays(
    {
      schedule: calendar.schedule,
      courses,
      cancellations: calendar.cancellations,
      recordings: calendar.recordings,
      lessons: calendar.lessons,
      presentByDate,
      studentJoinDates: ((studentsRes.data as { created_at: string }[] | null) ?? []).map((s) => s.created_at.slice(0, 10)),
      todayIso,
    },
    fromMonday,
    weeks,
  );

  const guessedCourse: Record<number, number | null> = {};
  for (const s of calendar.schedule) guessedCourse[s.id] = guessCourseId(s.subject, courses);

  return {
    schedule: calendar.schedule,
    courses,
    guessedCourse,
    days,
    mondays,
    currentMonday,
    todayIso,
    lessonsByCourse,
    error: coursesRes.error?.message ?? null,
  };
}
