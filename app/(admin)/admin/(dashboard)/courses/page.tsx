import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { CourseNotesAdminPanel } from "@/components/admin/courses/course-notes-admin-panel";
import {
  NOTE_SUMMARY_COLUMNS,
  summarizeNote,
  type LessonNoteSummary,
  type LessonNoteSummaryRow,
} from "@/lib/lesson-notes/summary";
import type { CourseLessonRow, CourseRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const supabase = createSupabaseAdminClient();
  const [coursesRes, lessonsRes, notesRes] = await Promise.all([
    supabase.from("courses").select("*").order("sort_order", { ascending: true }),
    supabase.from("course_lessons").select("*").order("position", { ascending: true }),
    supabase.from("lesson_notes").select(NOTE_SUMMARY_COLUMNS),
  ]);
  const noteRows = (notesRes.data as LessonNoteSummaryRow[] | null) ?? [];

  // Clip progress only matters for runs that haven't finished.
  const unfinished = noteRows.filter((n) => n.status !== "ready").map((n) => n.lesson_id);
  const segmentsRes = unfinished.length
    ? await supabase.from("lesson_transcript_segments").select("lesson_id").in("lesson_id", unfinished)
    : { data: [] };
  const segmentsDone = new Map<number, number>();
  for (const s of (segmentsRes.data as { lesson_id: number }[] | null) ?? []) {
    segmentsDone.set(s.lesson_id, (segmentsDone.get(s.lesson_id) ?? 0) + 1);
  }

  const notes: Record<number, LessonNoteSummary> = {};
  for (const note of noteRows) {
    notes[note.lesson_id] = summarizeNote(note, segmentsDone.get(note.lesson_id) ?? 0);
  }

  return (
    <CourseNotesAdminPanel
      courses={(coursesRes.data as CourseRow[] | null) ?? []}
      lessons={(lessonsRes.data as CourseLessonRow[] | null) ?? []}
      notes={notes}
      loadError={coursesRes.error?.message ?? lessonsRes.error?.message ?? notesRes.error?.message ?? null}
    />
  );
}
