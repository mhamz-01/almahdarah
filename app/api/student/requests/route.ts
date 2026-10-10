import { NextResponse } from "next/server";
import { validateEmail, validateName, validatePassword, validatePhone, validateUsername } from "@/lib/admin/student-validation";
import { hashPassword } from "@/lib/password";
import { encryptSecret } from "@/lib/secret-box";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const TIME_MAX_LENGTH = 120;
const EXPECTATIONS_MAX_LENGTH = 1000;

// Public endpoint: someone asks for a student-portal account. Nothing here
// grants access — the request just lands in /admin/students, and only an
// admin accepting it creates the students row that can sign in.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  // Honeypot — real users never see or fill this field. Pretend success.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const name = validateName(body.name);
  if (!name.ok) return NextResponse.json({ ok: false, error: name.error }, { status: 400 });
  const username = validateUsername(body.username);
  if (!username.ok) return NextResponse.json({ ok: false, error: username.error }, { status: 400 });
  const password = validatePassword(body.password);
  if (!password.ok) return NextResponse.json({ ok: false, error: password.error }, { status: 400 });

  const email = validateEmail(body.email);
  if (!email.ok) return NextResponse.json({ ok: false, error: email.error }, { status: 400 });
  const phone = validatePhone(body.phone);
  if (!phone.ok) return NextResponse.json({ ok: false, error: phone.error }, { status: 400 });

  const time = typeof body.time_at_almahdrah === "string" ? body.time_at_almahdrah.trim() : "";
  if (!time) return NextResponse.json({ ok: false, error: "Tell us how long you've been with Al-Mahdrah" }, { status: 400 });
  if (time.length > TIME_MAX_LENGTH) {
    return NextResponse.json({ ok: false, error: `That answer must be ${TIME_MAX_LENGTH} characters or fewer` }, { status: 400 });
  }

  const expectations = typeof body.expectations === "string" ? body.expectations.trim() : "";
  if (!expectations) {
    return NextResponse.json({ ok: false, error: "Tell us what you expect from the student portal" }, { status: 400 });
  }
  if (expectations.length > EXPECTATIONS_MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Expectations must be ${EXPECTATIONS_MAX_LENGTH} characters or fewer` },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const [existingStudent, existingRequest] = await Promise.all([
    supabase.from("students").select("id").eq("username", username.value).maybeSingle(),
    supabase.from("student_requests").select("id").eq("username", username.value).eq("status", "pending").maybeSingle(),
  ]);
  if (existingStudent.data || existingRequest.data) {
    return NextResponse.json({ ok: false, error: "That username is already taken — please choose another" }, { status: 409 });
  }

  const { error } = await supabase.from("student_requests").insert({
    name: name.value,
    username: username.value,
    password_hash: await hashPassword(password.value),
    password_enc: encryptSecret(password.value),
    email: email.value,
    phone: phone.value,
    time_at_almahdrah: time,
    expectations,
  });

  if (error) {
    const isDuplicate = error.code === "23505";
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "That username is already taken — please choose another" : "Couldn't send your request — please try again" },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
