import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { isIsoDate } from "@/lib/admin/schedule-validation";
import { slotOn } from "@/lib/students";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ClassRecordingRow, ClassScheduleRow } from "@/lib/types";

// Recordings are linked automatically by the nightly course sync. This lets the
// admin pick a different lesson for a class (or remove the link) when the guess
// was wrong. A hand-picked link is never replaced automatically.
export async function PUT(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { date?: unknown; lessonId?: unknown } | null;
  if (!isIsoDate(body?.date)) return NextResponse.json({ ok: false, error: "Choose a valid date" }, { status: 400 });
  const date = body.date;
  const supabase = createSupabaseAdminClient();

  if (body.lessonId === null) {
    // Stored as an admin row with no lesson, so automatic linking leaves this date alone
    // (deleting the row would just let the same video be linked again).
    const { data: rows } = await supabase.from("class_schedule").select("*");
    const slot = slotOn(((rows as ClassScheduleRow[] | null) ?? []).map((s) => ({ ...s, active_from: s.active_from ?? "2000-01-01" })), date);
    const { error } = slot
      ? await supabase
          .from("class_recordings")
          .upsert(
            { class_date: date, schedule_id: slot.id, lesson_id: null, source: "admin", linked_at: new Date().toISOString() },
            { onConflict: "class_date" },
          )
      : await supabase.from("class_recordings").delete().eq("class_date", date);
    if (error) {
      // Migration 0032 not run yet: lesson_id can't be empty, so fall back to removing the link.
      const fallback = await supabase.from("class_recordings").delete().eq("class_date", date);
      if (fallback.error) return NextResponse.json({ ok: false, error: fallback.error.message }, { status: 500 });
      return NextResponse.json({
        ok: true,
        recording: null,
        warning: "Removed, but it may be linked again automatically. Run migration 0032 so “No recording” sticks.",
      });
    }
    return NextResponse.json({ ok: true, recording: null });
  }

  const lessonId = Number(body.lessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return NextResponse.json({ ok: false, error: "Choose a lesson" }, { status: 400 });
  }
  const [{ data: lesson }, { data: scheduleRows }] = await Promise.all([
    supabase.from("course_lessons").select("id").eq("id", lessonId).maybeSingle(),
    supabase.from("class_schedule").select("*"),
  ]);
  if (!lesson) return NextResponse.json({ ok: false, error: "Lesson not found" }, { status: 404 });
  const slot = slotOn(((scheduleRows as ClassScheduleRow[] | null) ?? []).map((s) => ({ ...s, active_from: s.active_from ?? "2000-01-01" })), date);
  if (!slot) return NextResponse.json({ ok: false, error: "There's no class on that day" }, { status: 400 });

  // Free the lesson if it was linked to another date.
  await supabase.from("class_recordings").delete().eq("lesson_id", lessonId).neq("class_date", date);
  const { data, error } = await supabase
    .from("class_recordings")
    .upsert(
      { class_date: date, schedule_id: slot.id, lesson_id: lessonId, source: "admin", linked_at: new Date().toISOString() },
      { onConflict: "class_date" },
    )
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, recording: data as ClassRecordingRow });
}
