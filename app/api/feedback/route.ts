import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { FEEDBACK_AREAS, type FeedbackPayload } from "@/lib/feedback";

const clip = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export async function POST(request: Request) {
  let body: Partial<FeedbackPayload> & { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  if (body.website) return NextResponse.json({ ok: true });

  const message = clip(body.message, 4000);
  const rating = Number(body.rating);
  const areas = Array.isArray(body.areas)
    ? body.areas.filter((a): a is string => FEEDBACK_AREAS.some((x) => x.value === a))
    : [];

  if (!message) {
    return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("public_feedback").insert({
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
      areas,
      message,
      page_url: clip(request.headers.get("referer"), 500),
    });
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return NextResponse.json({ ok: false, error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
