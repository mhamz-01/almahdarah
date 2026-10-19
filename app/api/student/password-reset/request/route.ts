import { after, NextResponse } from "next/server";
import { validateEmail } from "@/lib/admin/student-validation";
import { emailConfigured, sendOne, siteUrl } from "@/lib/email/send";
import { renderPasswordResetCode } from "@/lib/email/templates";
import { clientIp, CODE_TTL_MS, generateCode, hashCode, rateLimitError } from "@/lib/password-reset";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Step 1 of "Forgot password?": email a 6-digit code to the account's address.
//
// The response is the same whether or not an account uses that email, and the
// email is sent after the response (after()), so neither the message nor the
// response time reveals which addresses are registered.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = validateEmail(body?.email);
  if (!email.ok) return NextResponse.json({ ok: false, error: email.error }, { status: 400 });

  // Checked before the account lookup, so it says nothing about which emails are registered.
  if (!emailConfigured()) {
    console.error("[password-reset] RESEND_API_KEY / EMAIL_FROM are not set in this environment");
    return NextResponse.json({ ok: false, error: "Password reset emails aren't available right now. Please contact your teacher." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const ip = clientIp(request);
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();

  const [lastRes, emailCountRes, ipCountRes, studentsRes] = await Promise.all([
    supabase
      .from("student_password_resets")
      .select("created_at")
      .eq("email", email.value)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("student_password_resets").select("id", { count: "exact", head: true }).eq("email", email.value).gte("created_at", hourAgo),
    ip
      ? supabase.from("student_password_resets").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", hourAgo)
      : Promise.resolve({ count: 0, error: null }),
    // Only accounts that can actually sign in (an admin may have created a row without a login).
    supabase.from("students").select("id").eq("email", email.value).not("password_hash", "is", null).limit(1),
  ]);
  if (lastRes.error || emailCountRes.error || ipCountRes.error || studentsRes.error) {
    return NextResponse.json({ ok: false, error: "Couldn't send a code right now. Please try again." }, { status: 500 });
  }

  const limited = rateLimitError(
    { emailLastAt: lastRes.data?.created_at ?? null, emailLastHour: emailCountRes.count ?? 0, ipLastHour: ipCountRes.count ?? 0 },
    now,
  );
  if (limited) return NextResponse.json({ ok: false, error: limited }, { status: 429 });

  const hasAccount = (studentsRes.data ?? []).length > 0;
  const code = hasAccount ? generateCode() : null;

  const { error } = await supabase.from("student_password_resets").insert({
    email: email.value,
    ip,
    code_hash: code ? hashCode(email.value, code) : null,
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
  });
  if (error) return NextResponse.json({ ok: false, error: "Couldn't send a code right now. Please try again." }, { status: 500 });

  if (code) {
    after(async () => {
      const message = renderPasswordResetCode(code, CODE_TTL_MS / 60000, siteUrl());
      const result = await sendOne({ to: email.value, ...message });
      if (!result.ok) console.error("[password-reset] code email failed:", result.error);
    });
  }

  return NextResponse.json({ ok: true });
}
