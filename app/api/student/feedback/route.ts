import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const KINDS = ["feedback", "complaint", "improvement"] as const;
const MESSAGE_MAX_LENGTH = 2000;

// A signed-in student sends feedback, a complaint or an improvement idea.
export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = KINDS.find((k) => k === body?.kind);
  if (!kind) return NextResponse.json({ ok: false, error: "Choose a type" }, { status: 400 });

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ ok: false, error: "Write your message first" }, { status: 400 });
  if (message.length > MESSAGE_MAX_LENGTH) {
    return NextResponse.json({ ok: false, error: `Keep it to ${MESSAGE_MAX_LENGTH} characters or fewer` }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("student_feedback").insert({ student_id: session.studentId, kind, message });
  if (error) return NextResponse.json({ ok: false, error: "Couldn't send — please try again" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
