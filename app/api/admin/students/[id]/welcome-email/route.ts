import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { sendOne, siteUrl } from "@/lib/email/send";
import { renderAccountApproved } from "@/lib/email/templates";
import { decryptSecret } from "@/lib/secret-box";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentAuthRow } from "@/lib/types";

// (Re)sends the welcome email with the student's sign-in details, e.g. when the
// automatic one sent on accepting their join request didn't go through.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) return NextResponse.json({ ok: false, error: "Invalid student" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("students").select("*").eq("id", studentId).maybeSingle();
  const student = data as StudentAuthRow | null;
  if (!student) return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
  if (!student.email) return NextResponse.json({ ok: false, error: "This student has no email address" }, { status: 400 });

  const password = decryptSecret(student.password_enc);
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Their password can't be shown. Set a new one with Edit first, then send the email." },
      { status: 409 },
    );
  }

  const result = await sendOne({
    to: student.email,
    ...renderAccountApproved({ name: student.name, username: student.username, password, siteUrl: siteUrl() }),
  });
  if (!result.ok) {
    console.error("[students] welcome email failed:", result.error);
    return NextResponse.json({ ok: false, error: `Email not sent: ${result.error ?? "unknown error"}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, to: student.email });
}
