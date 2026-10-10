import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Weekday } from "@/lib/types";

const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];
const MAX_BACKFILL_DAYS = 35; // matches the 5 weeks shown in the portal

type Resolved = { ok: true; classDate: string; day: Weekday } | { ok: false; error: string };

// The date comes from the optional `date` body field (YYYY-MM-DD) and is
// validated here: it must be a real weekday, never in the future, within the
// backfill window and not before the student joined. Without a date it is today.
async function resolveDate(req: Request, studentId: number): Promise<Resolved> {
  const body = (await req.json().catch(() => null)) as { date?: unknown } | null;
  const todayIso = new Date().toISOString().slice(0, 10);
  const classDate = typeof body?.date === "string" ? body.date : todayIso;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(classDate) || Number.isNaN(Date.parse(`${classDate}T00:00:00Z`))) {
    return { ok: false, error: "Invalid date" };
  }
  if (classDate > todayIso) return { ok: false, error: "You can't mark a future class" };

  const ageDays = (Date.parse(`${todayIso}T00:00:00Z`) - Date.parse(`${classDate}T00:00:00Z`)) / 86_400_000;
  if (ageDays > MAX_BACKFILL_DAYS) return { ok: false, error: "That class is too far back to change" };

  const day = WEEKDAY_BY_UTC_INDEX[new Date(`${classDate}T00:00:00Z`).getUTCDay()];
  if (!day) return { ok: false, error: "There's no class on that day" };

  if (classDate !== todayIso) {
    const supabase = createSupabaseAdminClient();
    const { data: student } = await supabase.from("students").select("created_at").eq("id", studentId).maybeSingle();
    if (!student || classDate < String(student.created_at).slice(0, 10)) {
      return { ok: false, error: "That class is from before you joined" };
    }
  }
  return { ok: true, classDate, day };
}

export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const r = await resolveDate(req, session.studentId);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: slot } = await supabase.from("class_schedule").select("status").eq("day", r.day).maybeSingle();
  if (!slot || slot.status !== "scheduled") {
    return NextResponse.json({ ok: false, error: "There was no class running that day" }, { status: 400 });
  }

  const { error } = await supabase
    .from("attendance")
    .upsert(
      { student_id: session.studentId, class_date: r.classDate, day: r.day, status: "present" },
      { onConflict: "student_id,class_date" },
    );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Undo — only ever removes the signed-in student's own row for that date.
export async function DELETE(req: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const r = await resolveDate(req, session.studentId);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("student_id", session.studentId)
    .eq("class_date", r.classDate);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
