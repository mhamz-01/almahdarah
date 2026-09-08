import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { createStudentSessionToken, STUDENT_SESSION_COOKIE, STUDENT_SESSION_TTL_SECONDS } from "@/lib/student-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentAuthRow } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string; remember?: boolean };
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Enter your username and password" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("students").select("*").eq("username", username).maybeSingle();
  const student = data as StudentAuthRow | null;

  // Same generic error whether the username doesn't exist, no login has
  // been generated for it yet, or the password is wrong — never reveal
  // which one it was.
  if (!student || !student.password_hash || !(await verifyPassword(password, student.password_hash))) {
    return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
  }

  await supabase.from("students").update({ last_login_at: new Date().toISOString() }).eq("id", student.id);

  const token = await createStudentSessionToken(student.id, student.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // "Keep me signed in" controls whether the cookie survives closing the
    // browser. Either way the JWT itself stays valid for a full 20 days.
    ...(body.remember ? { maxAge: STUDENT_SESSION_TTL_SECONDS } : {}),
  });
  return response;
}
