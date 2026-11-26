// Builds the admin's day-by-day view of the timetable (schedule page "This
// week" strip and the dashboard's "Today's class" card). Pure: the page loads
// the rows, this turns them into cards.

import { courseIdForSlot } from "@/lib/recordings-match";
import { addDaysIso, mondayOf, slotOn, weekdayOf } from "@/lib/students";
import type { ClassCancellationRow, ClassRecordingRow, ClassScheduleRow, CourseLessonRow, CourseRow, Weekday } from "@/lib/types";

export type AdminDayState = "no_class" | "cancelled" | "held" | "today" | "upcoming";

export interface AdminClassDay {
  date: string;
  day: Weekday;
  state: AdminDayState;
  scheduleId: number | null;
  subject: string | null;
  startTime: string | null;
  teacher: string | null;
  color: string | null;
  cancellation: { reason: string; note: string } | null;
  /** Students who punched in, and students enrolled by that date. */
  presentCount: number;
  studentCount: number;
  /** Course the recording comes from (set on the timetable row, or guessed). */
  courseId: number | null;
  recording: { lessonId: number; title: string; position: number; source: "auto" | "admin" } | null;
  /** The admin said this class has no recording. */
  noRecording: boolean;
}

export interface AdminWeekInput {
  schedule: ClassScheduleRow[];
  courses: Pick<CourseRow, "id" | "title">[];
  cancellations: ClassCancellationRow[];
  recordings: ClassRecordingRow[];
  lessons: Map<number, Pick<CourseLessonRow, "id" | "title" | "position">>;
  presentByDate: Map<string, number>;
  noRecordingDates?: Set<string>;
  studentJoinDates: string[];
  todayIso: string;
}

export function buildAdminDays(input: AdminWeekInput, fromMonday: string, weeks: number): AdminClassDay[] {
  const cancelled = new Map(input.cancellations.map((c) => [c.class_date, c]));
  const recordings = new Map(input.recordings.map((r) => [r.class_date, r]));
  const days: AdminClassDay[] = [];

  for (let w = 0; w < weeks; w++) {
    for (let i = 0; i < 5; i++) {
      const date = addDaysIso(fromMonday, w * 7 + i);
      const day = weekdayOf(date)!;
      const slot = slotOn(input.schedule, date);
      const c = cancelled.get(date);
      const rec = recordings.get(date);
      const lesson = rec ? input.lessons.get(rec.lesson_id) : undefined;
      const state: AdminDayState = !slot
        ? "no_class"
        : c
          ? "cancelled"
          : date < input.todayIso
            ? "held"
            : date === input.todayIso
              ? "today"
              : "upcoming";
      days.push({
        date,
        day,
        state,
        scheduleId: slot?.id ?? null,
        subject: slot?.subject ?? null,
        startTime: slot?.start_time ?? null,
        teacher: slot?.teacher ?? null,
        color: slot?.color ?? null,
        cancellation: c ? { reason: c.reason, note: c.note } : null,
        presentCount: input.presentByDate.get(date) ?? 0,
        studentCount: input.studentJoinDates.filter((d) => d <= date).length,
        courseId: slot ? courseIdForSlot(slot, input.courses) : null,
        recording: rec ? { lessonId: rec.lesson_id, title: lesson?.title ?? "Lesson", position: lesson?.position ?? 0, source: rec.source } : null,
        noRecording: !rec && (input.noRecordingDates?.has(date) ?? false),
      });
    }
  }
  return days;
}

export { mondayOf };
