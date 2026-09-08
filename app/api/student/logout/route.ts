import { NextResponse } from "next/server";
import { STUDENT_SESSION_COOKIE } from "@/lib/student-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDENT_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
