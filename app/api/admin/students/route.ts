import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { validateStudentPayload } from "@/lib/admin/student-validation";
import { hashPassword } from "@/lib/password";
import { encryptSecret } from "@/lib/secret-box";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentRow } from "@/lib/types";

// Enrolls a student with an admin-chosen username and password, so they can
// sign in to the portal straight away. Only the scrypt hash is used for login;
// the encrypted copy exists so the admin can view the password later.
export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const validated = validateStudentPayload(await request.json());
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const { password, ...fields } = validated.value;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .insert({ ...fields, password_hash: await hashPassword(password), password_enc: encryptSecret(password) })
    .select("id, created_at, name, username, avatar_color, email, phone")
    .single();

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "That username is already taken" : error.message },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, student: data as StudentRow, password });
}
