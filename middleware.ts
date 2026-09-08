import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/lib/student-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/student")) {
    if (pathname === "/student/login") {
      return NextResponse.next();
    }

    const session = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const payload = await verifyStudentSessionToken(session);

    if (!payload) {
      const loginUrl = new URL("/student/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear out any stale/invalid/expired cookie so it doesn't keep bouncing the student back here.
      response.cookies.set(STUDENT_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
      return response;
    }

    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await isValidAdminSession(session);

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
