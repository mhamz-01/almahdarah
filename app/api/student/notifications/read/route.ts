import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("student_notes")
    .update({ read: true })
    .eq("student_id", session.studentId)
    .eq("read", false);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
