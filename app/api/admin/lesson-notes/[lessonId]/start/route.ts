import { NextResponse } from "next/server";
import { jsonError, loadLessonForAdmin } from "@/lib/lesson-notes/admin-lesson";
import { MAX_LECTURE_SECONDS, segmentCount } from "@/lib/lesson-notes/config";
import type { LessonNoteRow } from "@/lib/types";

// Pipeline step 1: prepare a lesson for (re)generation and tell the browser
// how many clips to transcribe. Clips already transcribed are kept unless
// `restart` is set, so an interrupted run can resume where it stopped.
export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const loaded = await loadLessonForAdmin(params);
  if (loaded instanceof NextResponse) return loaded;
  const { supabase, lesson } = loaded;

  const body = (await request.json().catch(() => null)) as { durationSeconds?: unknown; restart?: unknown } | null;

  // The server can't read video length from YouTube (it gets bot-checked), so
  // the admin's browser reads it from the YouTube player the first time and we
  // keep it on the lesson.
  let duration = lesson.duration_seconds;
  if (!duration) {
    const fromClient = Math.floor(Number(body?.durationSeconds));
    if (!Number.isFinite(fromClient) || fromClient <= 0) return jsonError("Video length is required", 400);
    duration = fromClient;
  }
  if (duration > MAX_LECTURE_SECONDS) return jsonError("This video is longer than 4 hours", 400);
  if (duration !== lesson.duration_seconds) {
    const { error } = await supabase.from("course_lessons").update({ duration_seconds: duration }).eq("id", lesson.id);
    if (error) return jsonError(error.message, 500);
  }

  const segmentsTotal = segmentCount(duration);
  const { data: existing } = await supabase
    .from("lesson_notes")
    .select("segments_total")
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (body?.restart === true || (existing && existing.segments_total !== segmentsTotal)) {
    const { error } = await supabase.from("lesson_transcript_segments").delete().eq("lesson_id", lesson.id);
    if (error) return jsonError(error.message, 500);
  }

  // Only pipeline columns are written, so an existing draft / published copy
  // stays visible until the new run finishes.
  const { data: note, error } = await supabase
    .from("lesson_notes")
    .upsert(
      {
        lesson_id: lesson.id,
        status: "transcribing",
        segments_total: segmentsTotal,
        error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id" },
    )
    .select("*")
    .single();
  if (error) return jsonError(error.message, 500);

  const { data: done } = await supabase.from("lesson_transcript_segments").select("idx").eq("lesson_id", lesson.id);

  return NextResponse.json({
    ok: true,
    note: note as LessonNoteRow,
    durationSeconds: duration,
    segmentsTotal,
    doneSegments: ((done as { idx: number }[] | null) ?? []).map((s) => s.idx),
  });
}
