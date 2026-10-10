import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BoardCardRow, BoardStatus, StudentTaskRow } from "@/lib/types";

const STATUSES: BoardStatus[] = ["todo", "in_progress", "done"];

interface IncomingItem {
  source: "personal" | "assigned";
  taskId: number;
}

function parseItems(value: unknown): IncomingItem[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;
  const items: IncomingItem[] = [];
  for (const raw of value) {
    const item = raw as Partial<IncomingItem>;
    if ((item.source !== "personal" && item.source !== "assigned") || !Number.isInteger(item.taskId)) return null;
    items.push({ source: item.source, taskId: item.taskId as number });
  }
  return items;
}

// Adds the chosen personal / teacher tasks to the signed-in student's board.
export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { items?: unknown; status?: unknown } | null;
  const items = parseItems(body?.items);
  const status = body?.status as BoardStatus;
  if (!items || !STATUSES.includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const studentId = session.studentId;

  const personalIds = items.filter((i) => i.source === "personal").map((i) => i.taskId);
  const assignedIds = items.filter((i) => i.source === "assigned").map((i) => i.taskId);

  // Only the student's own personal tasks, and only teacher tasks that exist.
  const [ownedRes, assignedRes, existingRes] = await Promise.all([
    personalIds.length
      ? supabase.from("student_tasks").select("id").eq("student_id", studentId).in("id", personalIds)
      : Promise.resolve({ data: [] as { id: number }[] }),
    assignedIds.length
      ? supabase.from("tasks").select("id").in("id", assignedIds)
      : Promise.resolve({ data: [] as { id: number }[] }),
    supabase.from("board_cards").select("personal_task_id, assigned_task_id").eq("student_id", studentId),
  ]);

  const ownedPersonal = new Set((ownedRes.data ?? []).map((r) => r.id));
  const validAssigned = new Set((assignedRes.data ?? []).map((r) => r.id));
  const onBoardPersonal = new Set((existingRes.data ?? []).map((r) => r.personal_task_id).filter(Boolean));
  const onBoardAssigned = new Set((existingRes.data ?? []).map((r) => r.assigned_task_id).filter(Boolean));

  const rows = items
    .filter((i) =>
      i.source === "personal"
        ? ownedPersonal.has(i.taskId) && !onBoardPersonal.has(i.taskId)
        : validAssigned.has(i.taskId) && !onBoardAssigned.has(i.taskId),
    )
    .map((i) => ({
      student_id: studentId,
      status,
      personal_task_id: i.source === "personal" ? i.taskId : null,
      assigned_task_id: i.source === "assigned" ? i.taskId : null,
    }));

  if (rows.length === 0) return NextResponse.json({ ok: true, cards: [], tasks: [] });

  const { data, error } = await supabase.from("board_cards").insert(rows).select("*");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Keep personal tasks' checkbox in step with the column they landed in.
  const addedPersonal = rows.map((r) => r.personal_task_id).filter((id): id is number => id !== null);
  let tasks: StudentTaskRow[] = [];
  if (addedPersonal.length) {
    const { data: updated } = await supabase
      .from("student_tasks")
      .update({ completed: status === "done" })
      .eq("student_id", studentId)
      .in("id", addedPersonal)
      .select("*");
    tasks = (updated as StudentTaskRow[] | null) ?? [];
  }

  return NextResponse.json({ ok: true, cards: data as BoardCardRow[], tasks });
}
