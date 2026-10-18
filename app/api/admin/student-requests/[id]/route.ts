import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentRequestRow } from "@/lib/types";

const AVATAR_COLORS = ["#1182A3", "#2B7977", "#25345D", "#3E9E54", "#8a6b12", "#C1503F"];

// Accept (creates the student, so they can sign in) or reject a pending request.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  if (body?.action !== "accept" && body?.action !== "reject") {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("student_requests").select("*").eq("id", requestId).maybeSingle();
  const req = data as StudentRequestRow | null;
  if (!req) return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
  if (req.status !== "pending") {
    return NextResponse.json({ ok: false, error: `This request was already ${req.status}` }, { status: 409 });
  }

  const reviewedAt = new Date().toISOString();

  if (body.action === "reject") {
    const { error } = await supabase
      .from("student_requests")
      .update({ status: "rejected", reviewed_at: reviewedAt })
      .eq("id", requestId)
      .eq("status", "pending");
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data: student, error: insertError } = await supabase
    .from("students")
    .insert({
      name: req.name,
      username: req.username,
      avatar_color: AVATAR_COLORS[req.id % AVATAR_COLORS.length],
      password_hash: req.password_hash,
      password_enc: req.password_enc,
      email: req.email,
      phone: req.phone,
      approved_at: reviewedAt,
    })
    .select("id")
    .single();

  if (insertError) {
    const isDuplicate = insertError.code === "23505";
    return NextResponse.json(
      {
        ok: false,
        error: isDuplicate
          ? `The username "${req.username}" is already used by an enrolled student — reject this request instead.`
          : insertError.message,
      },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  const { error: updateError } = await supabase
    .from("student_requests")
    .update({ status: "accepted", reviewed_at: reviewedAt, student_id: student.id })
    .eq("id", requestId);
  if (updateError) return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, studentId: student.id as number });
}
