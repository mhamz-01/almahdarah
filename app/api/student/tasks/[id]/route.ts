import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { formFiles, STUDENT_TASK_BUCKET, uploadStudentTaskFiles } from "@/lib/student-task-files";
import { validateStudentTaskFields, validateStudentTaskFiles } from "@/lib/student-task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { BoardCardRow, StudentTaskAttachment, StudentTaskRow } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Every query filters on BOTH the task id and the session's student id, so a
// student can only ever touch their own personal tasks.
async function loadOwned(id: string, studentId: number) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("student_tasks")
    .select("*")
    .eq("id", id)
    .eq("student_id", studentId)
    .maybeSingle();
  return { supabase, task: data as StudentTaskRow | null };
}

export async function PATCH(request: Request, { params }: Ctx) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { supabase, task } = await loadOwned(id, session.studentId);
  if (!task) return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });

  // Quick toggle: JSON { completed: boolean }
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    const body = (await request.json()) as { completed?: unknown };
    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("student_tasks")
      .update({ completed: body.completed })
      .eq("id", id)
      .eq("student_id", session.studentId)
      .select("*")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    // If this task is on the board, keep its column in step with the checkbox.
    const { data: card } = await supabase
      .from("board_cards")
      .update({ status: body.completed ? "done" : "todo", moved_at: new Date().toISOString() })
      .eq("student_id", session.studentId)
      .eq("personal_task_id", id)
      .select("*")
      .maybeSingle();

    return NextResponse.json({ ok: true, task: data as StudentTaskRow, card: (card as BoardCardRow | null) ?? null });
  }

  // Full edit: multipart form
  const form = await request.formData();
  const validated = validateStudentTaskFields(
    Object.fromEntries(["subject", "title", "description", "due_date"].map((k) => [k, form.get(k)])),
  );
  if (!validated.ok) return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });

  const removePaths = new Set(form.getAll("remove_paths").map(String));
  const kept: StudentTaskAttachment[] = task.attachments.filter((a) => !removePaths.has(a.path));
  const removed = task.attachments.filter((a) => removePaths.has(a.path));

  const files = formFiles(form);
  const fileError = validateStudentTaskFiles(files, kept.length);
  if (fileError) return NextResponse.json({ ok: false, error: fileError }, { status: 400 });

  const upload = await uploadStudentTaskFiles(supabase, session.studentId, files);
  if (!upload.ok) {
    if (upload.uploaded.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(upload.uploaded);
    return NextResponse.json({ ok: false, error: upload.error }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("student_tasks")
    .update({ ...validated.value, attachments: [...kept, ...upload.attachments] })
    .eq("id", id)
    .eq("student_id", session.studentId)
    .select("*")
    .single();
  if (error) {
    if (upload.attachments.length) {
      await supabase.storage.from(STUDENT_TASK_BUCKET).remove(upload.attachments.map((a) => a.path));
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (removed.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(removed.map((a) => a.path));
  return NextResponse.json({ ok: true, task: data as StudentTaskRow });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { supabase, task } = await loadOwned(id, session.studentId);
  if (!task) return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });

  const { error } = await supabase.from("student_tasks").delete().eq("id", id).eq("student_id", session.studentId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (task.attachments.length) {
    await supabase.storage.from(STUDENT_TASK_BUCKET).remove(task.attachments.map((a) => a.path));
  }
  return NextResponse.json({ ok: true });
}
