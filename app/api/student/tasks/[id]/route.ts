import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { formFiles, STUDENT_TASK_BUCKET, uploadStudentTaskFiles } from "@/lib/student-task-files";
import {
  STUDENT_TASK_MAX_FILES,
  validateStudentTaskFields,
  validateStudentTaskFiles,
  validateStudentTaskQuickUpdate,
} from "@/lib/student-task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { discardClaimed, parseClaimed, verifyUploads } from "@/lib/upload-targets";
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

  // Quick update: JSON { completed?: boolean, planned_date?: string | null, notes?: string }
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    const parsed = validateStudentTaskQuickUpdate(await request.json().catch(() => null));
    if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    const { completed, planned_date, notes } = parsed.value;

    const changes: Record<string, unknown> = {};
    if (completed !== undefined) {
      changes.completed = completed;
      changes.completed_at = completed ? new Date().toISOString() : null;
    }
    if (planned_date !== undefined) changes.planned_date = planned_date;
    if (notes !== undefined) changes.notes = notes;

    const { data, error } = await supabase
      .from("student_tasks")
      .update(changes)
      .eq("id", id)
      .eq("student_id", session.studentId)
      .select("*")
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    // If this task is on the board, keep its column in step with the checkbox.
    let card: BoardCardRow | null = null;
    if (completed !== undefined) {
      const { data: updated } = await supabase
        .from("board_cards")
        .update({ status: completed ? "done" : "todo", moved_at: new Date().toISOString() })
        .eq("student_id", session.studentId)
        .eq("personal_task_id", id)
        .select("*")
        .maybeSingle();
      card = (updated as BoardCardRow | null) ?? null;
    }

    return NextResponse.json({ ok: true, task: data as StudentTaskRow, card });
  }

  // Full edit: multipart form
  const form = await request.formData();
  const folder = `${session.studentId}/`;
  const claimed = parseClaimed(form.get("uploads"));
  const validated = validateStudentTaskFields(
    Object.fromEntries(["subject", "title", "description", "due_date", "planned_date"].map((k) => [k, form.get(k)])),
  );
  if (!validated.ok) {
    await discardClaimed(supabase, STUDENT_TASK_BUCKET, claimed, folder);
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const removePaths = new Set(form.getAll("remove_paths").map(String));
  const kept: StudentTaskAttachment[] = task.attachments.filter((a) => !removePaths.has(a.path));
  const removed = task.attachments.filter((a) => removePaths.has(a.path));

  const files = formFiles(form);
  const fileError =
    kept.length + claimed.length + files.length > STUDENT_TASK_MAX_FILES
      ? `A task can have at most ${STUDENT_TASK_MAX_FILES} files`
      : validateStudentTaskFiles(files, kept.length + claimed.length);
  if (fileError) {
    await discardClaimed(supabase, STUDENT_TASK_BUCKET, claimed, folder);
    return NextResponse.json({ ok: false, error: fileError }, { status: 400 });
  }

  const direct = await verifyUploads(supabase, STUDENT_TASK_BUCKET, claimed, folder);
  if (!direct.ok) return NextResponse.json({ ok: false, error: direct.error }, { status: 400 });

  const upload = await uploadStudentTaskFiles(supabase, session.studentId, files);
  if (!upload.ok) {
    await discardClaimed(supabase, STUDENT_TASK_BUCKET, claimed, folder);
    if (upload.uploaded.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(upload.uploaded);
    return NextResponse.json({ ok: false, error: upload.error }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("student_tasks")
    .update({ ...validated.value, attachments: [...kept, ...direct.items, ...upload.attachments] })
    .eq("id", id)
    .eq("student_id", session.studentId)
    .select("*")
    .single();
  if (error) {
    const orphaned = [...direct.items, ...upload.attachments].map((a) => a.path);
    if (orphaned.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(orphaned);
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
