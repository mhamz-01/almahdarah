import { cookies } from "next/headers";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/lib/student-auth";

// Server components / route handlers only (reads next/headers cookies()).
// Middleware already blocks unauthenticated requests to protected /student
// routes, but callers should still treat a null result as "not signed in" —
// e.g. the token can expire between the middleware check and the render.
export async function getStudentSession() {
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  return verifyStudentSessionToken(token);
}
