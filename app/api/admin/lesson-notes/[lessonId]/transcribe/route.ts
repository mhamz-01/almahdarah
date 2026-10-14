import { NextResponse } from "next/server";
import { jsonError, loadLessonForAdmin } from "@/lib/lesson-notes/admin-lesson";
import { segmentBounds } from "@/lib/lesson-notes/config";
import { RetryableError, transcribeSegment } from "@/lib/lesson-notes/transcribe";

// A 20-minute clip takes Gemini a few minutes. Needs Vercel Fluid compute (Hobby max 300s).
export const maxDuration = 300;

// Pipeline step 2: transcribe one clip (SEGMENT_SECONDS long) (`segment` is its 0-based
// index). The browser calls this once per clip, in order. Re-running a clip
// simply overwrites its row, so retries are safe.
export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const loaded = await loadLessonForAdmin(params);
  if (loaded instanceof NextResponse) return loaded;
  const { supabase, lesson } = loaded;

  const body = (await request.json().catch(() => null)) as { segment?: unknown } | null;
  const segment = body?.segment;

  const { data: note } = await supabase
    .from("lesson_notes")
    .select("status, segments_total")
    .eq("lesson_id", lesson.id)
    .maybeSingle();
  if (!note || note.status !== "transcribing" || !lesson.duration_seconds) {
    return jsonError("Start generation for this lesson first", 409);
  }
  if (typeof segment !== "number" || !Number.isInteger(segment) || segment < 0 || segment >= note.segments_total) {
    return jsonError("Invalid segment", 400);
  }

  const { start, end } = segmentBounds(segment, lesson.duration_seconds);

  let text: string;
  try {
    text = await transcribeSegment(lesson.youtube_video_id, start, end);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    if (err instanceof RetryableError) {
      return jsonError(message, 503, { retryable: true, retryAfterSeconds: err.retryAfterSeconds });
    }
    await supabase
      .from("lesson_notes")
      .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
      .eq("lesson_id", lesson.id);
    return jsonError(message, 502);
  }

  const { error } = await supabase.from("lesson_transcript_segments").upsert(
    { lesson_id: lesson.id, idx: segment, start_seconds: start, end_seconds: end, text },
    { onConflict: "lesson_id,idx" },
  );
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true, segment, chars: text.length });
}
