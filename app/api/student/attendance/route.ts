import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Weekday } from "@/lib/types";

const WEEKDAY_BY_UTC_INDEX: (Weekday | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];

function today() {
  const now = new Date();
  return { classDate: now.toISOString().slice(0, 10), day: WEEKDAY_BY_UTC_INDEX[now.getUTCDay()] };
}

// Marks the signed-in student present for TODAY's class only — the date and
// weekday always come from the server clock, never from the request body,
// so a student can't punch attendance for any day but today.
export async function POST() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { classDate, day } = today();
  if (!day) return NextResponse.json({ ok: false, error: "There's no class today" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: slot } = await supabase.from("class_schedule").select("status").eq("day", day).maybeSingle();
  if (!slot || slot.status !== "scheduled") {
    return NextResponse.json({ ok: false, error: "There's no class running today" }, { status: 400 });
  }

  const { error } = await supabase
    .from("attendance")
    .upsert(
      { student_id: session.studentId, class_date: classDate, day, status: "present" },
      { onConflict: "student_id,class_date" },
    );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Undo — only ever removes today's own row for the signed-in student.
export async function DELETE() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { classDate } = today();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("student_id", session.studentId)
    .eq("class_date", classDate);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
