import { NextResponse } from "next/server";
import { validateEmailPrefs } from "@/lib/email/prefs";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentEmailPrefsRow } from "@/lib/types";

// A student's own email settings. Everything is keyed on the session's student id,
// so nobody can read or change another student's settings.
export async function PATCH(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = validateEmailPrefs(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  const { email, ...prefs } = parsed.value;

  const supabase = createSupabaseAdminClient();

  if (email !== undefined) {
    const { error } = await supabase.from("students").update({ email }).eq("id", session.studentId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let saved: StudentEmailPrefsRow | null = null;
  if (Object.keys(prefs).length) {
    const { data, error } = await supabase
      .from("student_email_prefs")
      .upsert({ student_id: session.studentId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: "student_id" })
      .select("*")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    saved = data as StudentEmailPrefsRow;
  }

  return NextResponse.json({ ok: true, prefs: saved, email: email ?? null });
}
