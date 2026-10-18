import { NextResponse } from "next/server";
import { sendPreview } from "@/lib/email/run";
import { getStudentSession } from "@/lib/get-student-session";

// "Send me a test email": a sample of either message, sent only to the signed-in student's own address.
export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { kind?: unknown } | null;
  if (body?.kind !== "digest" && body?.kind !== "reminder") {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  let result;
  try {
    result = await sendPreview(session.studentId, body.kind);
  } catch (e) {
    // e.g. a database migration that hasn't been run yet; say what failed instead of a bare 500.
    return NextResponse.json({ ok: false, error: `Couldn't prepare the email: ${e instanceof Error ? e.message : "unknown error"}` }, { status: 500 });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.retryAfterSeconds ? 429 : 400 });
  }
  return NextResponse.json({ ok: true, sentTo: result.sentTo });
}
