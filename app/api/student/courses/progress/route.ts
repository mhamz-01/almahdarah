import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Saves the signed-in student's position in a lesson (and whether they finished it).
export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    lessonId?: unknown;
    position?: unknown;
    completed?: unknown;
  } | null;

  const lessonId = body?.lessonId;
  const position = Math.max(0, Math.floor(Number(body?.position) || 0));
  if (typeof lessonId !== "number" || !Number.isInteger(lessonId)) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: lesson } = await supabase.from("course_lessons").select("id").eq("id", lessonId).maybeSingle();
  if (!lesson) return NextResponse.json({ ok: false, error: "Lesson not found" }, { status: 404 });

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("student_id", session.studentId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  // Once completed, a lesson stays completed even if it's re-watched.
  const completed = body?.completed === true || existing?.completed === true;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      student_id: session.studentId,
      lesson_id: lessonId,
      last_position_seconds: position,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" },
  );
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, completed });
}
