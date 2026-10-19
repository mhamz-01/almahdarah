import { after, NextResponse } from "next/server";
import { validatePassword } from "@/lib/admin/student-validation";
import { sendOne, siteUrl } from "@/lib/email/send";
import { renderPasswordChanged } from "@/lib/email/templates";
import { hashPassword } from "@/lib/password";
import { hashResetToken, resetTokenExpired } from "@/lib/password-reset";
import { encryptSecret } from "@/lib/secret-box";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const EXPIRED = "This reset link has expired. Please start again and request a new code.";

// Step 3 of "Forgot password?": set the new password with the token from a
// verified code. The token is claimed (used_at) before the password changes,
// so it works exactly once. Setting password_changed_at signs the account out
// everywhere else (lib/get-student-session.ts).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: unknown; studentId?: unknown; password?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";
  const studentId = typeof body?.studentId === "number" && Number.isInteger(body.studentId) ? body.studentId : null;
  if (!token || studentId === null) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const password = validatePassword(body?.password);
  if (!password.ok) return NextResponse.json({ ok: false, error: password.error }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("student_password_resets")
    .select("id, email, verified_at, used_at")
    .eq("reset_token_hash", hashResetToken(token))
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "Couldn't reset your password. Please try again." }, { status: 500 });
  if (!row || !row.verified_at || row.used_at || resetTokenExpired(row.verified_at)) {
    return NextResponse.json({ ok: false, error: EXPIRED }, { status: 400 });
  }

  // The account must belong to the verified email.
  const { data: student } = await supabase
    .from("students")
    .select("id, username")
    .eq("id", studentId)
    .eq("email", row.email)
    .not("password_hash", "is", null)
    .maybeSingle();
  if (!student) return NextResponse.json({ ok: false, error: EXPIRED }, { status: 400 });

  const now = new Date().toISOString();
  const { data: claimed } = await supabase
    .from("student_password_resets")
    .update({ used_at: now })
    .eq("id", row.id)
    .is("used_at", null)
    .select("id");
  if (!claimed?.length) return NextResponse.json({ ok: false, error: EXPIRED }, { status: 400 });

  const { error: updateError } = await supabase
    .from("students")
    .update({
      password_hash: await hashPassword(password.value),
      password_enc: encryptSecret(password.value),
      password_changed_at: now,
    })
    .eq("id", student.id);
  if (updateError) {
    return NextResponse.json({ ok: false, error: "Couldn't save your new password. Please start again." }, { status: 500 });
  }

  // Any other outstanding codes for this email are now pointless; retire them.
  await supabase.from("student_password_resets").update({ used_at: now }).eq("email", row.email).is("used_at", null);

  after(async () => {
    const result = await sendOne({ to: row.email, ...renderPasswordChanged(student.username, siteUrl()) });
    if (!result.ok) console.error("[password-reset] confirmation email failed:", result.error);
  });

  return NextResponse.json({ ok: true, username: student.username });
}
