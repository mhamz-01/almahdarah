import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Removing a student cascades to their attendance and notes (see the
// `on delete cascade` foreign keys in 0008_create_students_and_attendance.sql).
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ ok: false, error: "Invalid student" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
