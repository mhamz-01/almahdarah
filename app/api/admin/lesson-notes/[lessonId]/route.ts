import { NextResponse } from "next/server";
import { jsonError, loadLessonForAdmin } from "@/lib/lesson-notes/admin-lesson";
import type { LessonNoteRow, LessonTranscriptSegmentRow } from "@/lib/types";

const MAX_NOTES_CHARS = 100_000;

// The note plus its transcript, for the admin review dialog.
export async function GET(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const loaded = await loadLessonForAdmin(params);
  if (loaded instanceof NextResponse) return loaded;
  const { supabase, lesson } = loaded;

  const [{ data: note }, { data: segments }] = await Promise.all([
    supabase.from("lesson_notes").select("*").eq("lesson_id", lesson.id).maybeSingle(),
    supabase
      .from("lesson_transcript_segments")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("idx", { ascending: true }),
  ]);

  return NextResponse.json({
    ok: true,
    note: note as LessonNoteRow | null,
    segments: (segments as LessonTranscriptSegmentRow[] | null) ?? [],
  });
}

// Pipeline step 4 (and admin edits): save the edited draft, publish it to
// students, or take it down.
//   { draftMd: string }        → save edits to the draft
//   { action: "publish" }      → students now see the current draft
//   { action: "unpublish" }    → students no longer see any notes
export async function PATCH(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const loaded = await loadLessonForAdmin(params);
  if (loaded instanceof NextResponse) return loaded;
  const { supabase, lesson } = loaded;

  const body = (await request.json().catch(() => null)) as { draftMd?: unknown; action?: unknown } | null;

  const { data: existing } = await supabase.from("lesson_notes").select("*").eq("lesson_id", lesson.id).maybeSingle();
  const note = existing as LessonNoteRow | null;
  if (!note) return jsonError("This lesson has no notes yet", 404);

  const now = new Date().toISOString();
  const patch: Partial<LessonNoteRow> = { updated_at: now };

  if (body?.draftMd !== undefined) {
    if (typeof body.draftMd !== "string" || !body.draftMd.trim()) return jsonError("Notes can't be empty", 400);
    if (body.draftMd.length > MAX_NOTES_CHARS) return jsonError("Notes are too long", 400);
    patch.draft_md = body.draftMd.trim();
  }

  if (body?.action === "publish") {
    const draft = patch.draft_md ?? note.draft_md;
    if (!draft) return jsonError("There's no draft to publish", 400);
    patch.published_md = draft;
    // Keep the first publish time, so later edits don't re-announce the notes.
    patch.published_at = note.published_at ?? now;
  } else if (body?.action === "unpublish") {
    patch.published_md = null;
    patch.published_at = null;
  } else if (body?.action !== undefined) {
    return jsonError("Unknown action", 400);
  }

  const { data: saved, error } = await supabase
    .from("lesson_notes")
    .update(patch)
    .eq("lesson_id", lesson.id)
    .select("*")
    .single();
  if (error) return jsonError(error.message, 500);

  return NextResponse.json({ ok: true, note: saved as LessonNoteRow });
}
