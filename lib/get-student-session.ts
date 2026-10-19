import { cache } from "react";
import { cookies } from "next/headers";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/lib/student-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Server components / route handlers only (reads next/headers cookies()).
// Middleware already blocks unauthenticated requests to protected /student
// routes, but callers should still treat a null result as "not signed in" —
// e.g. the token can expire between the middleware check and the render.
//
// Middleware only checks the JWT signature (it runs on the edge, without the
// database). This also checks the account still exists and that the token was
// issued after the last password reset, so a reset signs out every device.
// cache() runs that lookup once per request even when layout and page both ask.
export const getStudentSession = cache(async () => {
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const session = await verifyStudentSessionToken(token);
  if (!session) return null;

  const { data, error } = await createSupabaseAdminClient()
    .from("students")
    .select("password_changed_at")
    .eq("id", session.studentId)
    .maybeSingle();
  if (error || !data) return null;

  if (data.password_changed_at && session.issuedAt < Math.floor(new Date(data.password_changed_at).getTime() / 1000)) return null;
  return session;
});
