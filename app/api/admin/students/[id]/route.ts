import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateName, validatePassword, validateUsername } from "@/lib/admin/student-validation";
import { hashPassword } from "@/lib/password";
import { encryptSecret } from "@/lib/secret-box";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Edits a student's name, username and/or password. `password` is optional —
// omit it to leave the current one untouched.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ ok: false, error: "Invalid student" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const name = validateName(body.name);
  if (!name.ok) return NextResponse.json({ ok: false, error: name.error }, { status: 400 });
  const username = validateUsername(body.username);
  if (!username.ok) return NextResponse.json({ ok: false, error: username.error }, { status: 400 });

  const update: Record<string, string> = { name: name.value, username: username.value };

  let newPassword: string | null = null;
  if (typeof body.password === "string" && body.password !== "") {
    const password = validatePassword(body.password);
    if (!password.ok) return NextResponse.json({ ok: false, error: password.error }, { status: 400 });
    newPassword = password.value;
    update.password_hash = await hashPassword(password.value);
    update.password_enc = encryptSecret(password.value);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .update(update)
    .eq("id", studentId)
    .select("id, name, username")
    .maybeSingle();

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "That username is already taken" : error.message },
      { status: isDuplicate ? 409 : 500 },
    );
  }
  if (!data) return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });

  return NextResponse.json({ ok: true, student: data as { id: number; name: string; username: string }, password: newPassword });
}

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
