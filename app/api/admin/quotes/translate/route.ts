import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { translateQuoteText } from "@/lib/admin/ai-assist";
import { QUOTE_LIMITS } from "@/lib/admin/quote-limits";

export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ ok: false, error: "Quote text is required" }, { status: 400 });
  }
  if (text.length > QUOTE_LIMITS.body) {
    return NextResponse.json(
      { ok: false, error: `Quote text must be ${QUOTE_LIMITS.body} characters or fewer` },
      { status: 400 },
    );
  }

  try {
    const translatedText = await translateQuoteText(text);
    return NextResponse.json({ ok: true, translatedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
