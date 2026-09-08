import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { generatePassword, hashPassword } from "@/lib/password";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Generates a brand-new password for a student's portal login (overwriting
// any existing one) and returns it in plaintext exactly once, for the admin
// to copy and share with the student out of band. It is never stored or
// logged anywhere in plaintext — only its scrypt hash is persisted.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ ok: false, error: "Invalid student" }, { status: 400 });
  }

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("students")
    .update({ password_hash: passwordHash })
    .eq("id", studentId)
    .select("username")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, username: data.username as string, password });
}
