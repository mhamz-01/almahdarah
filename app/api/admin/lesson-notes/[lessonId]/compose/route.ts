import { NextResponse } from "next/server";
import { jsonError, loadLessonForAdmin } from "@/lib/lesson-notes/admin-lesson";
import { composeLessonNotes } from "@/lib/lesson-notes/compose";
import type { LessonNoteRow, LessonTranscriptSegmentRow } from "@/lib/types";

export const maxDuration = 60;

// Pipeline step 3: once every clip is transcribed, join them and have OpenAI
// write the notes. The result is saved as a draft for the admin to review —
// students don't see anything until it's published.
export async function POST(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const loaded = await loadLessonForAdmin(params);
  if (loaded instanceof NextResponse) return loaded;
  const { supabase, lesson, course } = loaded;

  const [{ data: note }, { data: segments }] = await Promise.all([
    supabase.from("lesson_notes").select("segments_total").eq("lesson_id", lesson.id).maybeSingle(),
    supabase
      .from("lesson_transcript_segments")
      .select("idx, text")
      .eq("lesson_id", lesson.id)
      .order("idx", { ascending: true }),
  ]);
  const parts = (segments as Pick<LessonTranscriptSegmentRow, "idx" | "text">[] | null) ?? [];
  if (!note || parts.length !== note.segments_total) {
    return jsonError("The transcript isn't complete yet", 409);
  }

  const transcript = parts.map((p) => p.text).filter(Boolean).join("\n\n");
  if (!transcript.trim()) return jsonError("No speech was found in this video", 422);

  await supabase
    .from("lesson_notes")
    .update({ status: "composing", updated_at: new Date().toISOString() })
    .eq("lesson_id", lesson.id);

  try {
    const draft = await composeLessonNotes({ courseTitle: course.title, lessonTitle: lesson.title, transcript });
    const now = new Date().toISOString();
    const { data: saved, error } = await supabase
      .from("lesson_notes")
      .update({ status: "ready", draft_md: draft, error: null, generated_at: now, updated_at: now })
      .eq("lesson_id", lesson.id)
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true, note: saved as LessonNoteRow });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notes generation failed";
    await supabase
      .from("lesson_notes")
      .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
      .eq("lesson_id", lesson.id);
    return jsonError(message, 502);
  }
}
