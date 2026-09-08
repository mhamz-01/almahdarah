import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateStudentPayload } from "@/lib/admin/student-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentRow } from "@/lib/types";

// Enrolls a brand-new student (name, username, level) with no portal login
// yet — password_hash stays null until the admin generates one from
// /admin/students later.
export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const validated = validateStudentPayload(await request.json());
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("students").insert(validated.value).select("*").single();

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "That username is already taken" : error.message },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, student: data as StudentRow });
}
