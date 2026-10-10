import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BoardCardRow, BoardStatus, StudentTaskRow } from "@/lib/types";

const STATUSES: BoardStatus[] = ["todo", "in_progress", "done"];

type Ctx = { params: Promise<{ id: string }> };

// Moves a card between columns. Filters on both the card id and the session's
// student id, so a student can only ever move their own cards.
export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status as BoardStatus;
  if (!STATUSES.includes(status)) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("board_cards")
    .update({ status, moved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("student_id", session.studentId)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "Card not found" }, { status: 404 });
  const card = data as BoardCardRow;

  let task: StudentTaskRow | null = null;
  if (card.personal_task_id !== null) {
    const { data: updated } = await supabase
      .from("student_tasks")
      .update({ completed: status === "done" })
      .eq("id", card.personal_task_id)
      .eq("student_id", session.studentId)
      .select("*")
      .maybeSingle();
    task = (updated as StudentTaskRow | null) ?? null;
  }

  return NextResponse.json({ ok: true, card, task });
}

// Removes the card from the board only — the underlying task is untouched.
export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("board_cards").delete().eq("id", id).eq("student_id", session.studentId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
