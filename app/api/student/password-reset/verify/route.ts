import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/admin/student-validation";
import { codeMatches, generateResetToken, hashResetToken, isExpired, MAX_CODE_ATTEMPTS, normalizeCode } from "@/lib/password-reset";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const INVALID = "That code is incorrect or has expired. Check the latest email, or request a new code.";

// Step 2 of "Forgot password?": check the emailed code. Only the newest code
// for the email counts, each code allows MAX_CODE_ATTEMPTS guesses and can be
// verified once. Success returns a single-use reset token plus the accounts
// that use this email (siblings can share one family address).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; code?: unknown } | null;
  const email = validateEmail(body?.email);
  const code = normalizeCode(body?.code);
  if (!email.ok || !code) return NextResponse.json({ ok: false, error: "Enter the 6-digit code from the email" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase
    .from("student_password_resets")
    .select("id, code_hash, expires_at, attempts, verified_at, used_at")
    .eq("email", email.value)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "Couldn't check the code. Please try again." }, { status: 500 });

  if (!row || !row.code_hash || row.verified_at || row.used_at || isExpired(row.expires_at)) {
    return NextResponse.json({ ok: false, error: INVALID }, { status: 400 });
  }
  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: "Too many incorrect tries. Please request a new code." }, { status: 429 });
  }

  // Count the guess before checking it. The attempts filter makes this a
  // compare-and-set, so parallel guesses can't share one attempt.
  const { data: counted } = await supabase
    .from("student_password_resets")
    .update({ attempts: row.attempts + 1 })
    .eq("id", row.id)
    .eq("attempts", row.attempts)
    .select("id");
  if (!counted?.length) return NextResponse.json({ ok: false, error: "Please try again." }, { status: 409 });

  if (!codeMatches(email.value, code, row.code_hash)) {
    const left = MAX_CODE_ATTEMPTS - (row.attempts + 1);
    return NextResponse.json(
      { ok: false, error: left > 0 ? `That code is incorrect. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many incorrect tries. Please request a new code." },
      { status: 400 },
    );
  }

  const token = generateResetToken();
  const { data: verified } = await supabase
    .from("student_password_resets")
    .update({ verified_at: new Date().toISOString(), reset_token_hash: hashResetToken(token) })
    .eq("id", row.id)
    .is("verified_at", null)
    .select("id");
  if (!verified?.length) return NextResponse.json({ ok: false, error: INVALID }, { status: 400 });

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, name, username")
    .eq("email", email.value)
    .not("password_hash", "is", null)
    .order("name");
  if (studentsError || !students?.length) return NextResponse.json({ ok: false, error: INVALID }, { status: 400 });

  return NextResponse.json({ ok: true, token, accounts: students });
}
