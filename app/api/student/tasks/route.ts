import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { formFiles, STUDENT_TASK_BUCKET, uploadStudentTaskFiles } from "@/lib/student-task-files";
import { STUDENT_TASK_MAX_FILES, validateStudentTaskFields, validateStudentTaskFiles } from "@/lib/student-task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { discardClaimed, parseClaimed, verifyUploads } from "@/lib/upload-targets";
import type { StudentTaskRow } from "@/lib/types";

const MAX_FILES = STUDENT_TASK_MAX_FILES;

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const supabase = createSupabaseAdminClient();
  const folder = `${session.studentId}/`;
  // Files the browser already uploaded straight to Storage (lib/upload-targets.ts).
  const claimed = parseClaimed(form.get("uploads"));
  const validated = validateStudentTaskFields(
    Object.fromEntries(["subject", "title", "description", "due_date", "planned_date"].map((k) => [k, form.get(k)])),
  );
  if (!validated.ok) {
    await discardClaimed(supabase, STUDENT_TASK_BUCKET, claimed, folder);
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const files = formFiles(form);
  const fileError = claimed.length + files.length > MAX_FILES ? `A task can have at most ${MAX_FILES} files` : validateStudentTaskFiles(files, claimed.length);
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
    .insert({ ...validated.value, student_id: session.studentId, attachments: [...direct.items, ...upload.attachments] })
    .select("*")
    .single();

  if (error) {
    const orphaned = [...direct.items, ...upload.attachments].map((a) => a.path);
    if (orphaned.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(orphaned);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, task: data as StudentTaskRow });
}
