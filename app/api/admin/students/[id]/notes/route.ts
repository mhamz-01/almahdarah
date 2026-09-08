import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const NOTE_MAX_LENGTH = 500;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ ok: false, error: "Invalid student" }, { status: 400 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const noteBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!noteBody) {
    return NextResponse.json({ ok: false, error: "Note can't be empty" }, { status: 400 });
  }
  if (noteBody.length > NOTE_MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Note must be ${NOTE_MAX_LENGTH} characters or fewer` },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("student_notes").insert({ student_id: studentId, body: noteBody });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
