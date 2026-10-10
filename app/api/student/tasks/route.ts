import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { formFiles, STUDENT_TASK_BUCKET, uploadStudentTaskFiles } from "@/lib/student-task-files";
import { validateStudentTaskFields, validateStudentTaskFiles } from "@/lib/student-task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentTaskRow } from "@/lib/types";

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const validated = validateStudentTaskFields(
    Object.fromEntries(["subject", "title", "description", "due_date"].map((k) => [k, form.get(k)])),
  );
  if (!validated.ok) return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });

  const files = formFiles(form);
  const fileError = validateStudentTaskFiles(files, 0);
  if (fileError) return NextResponse.json({ ok: false, error: fileError }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const upload = await uploadStudentTaskFiles(supabase, session.studentId, files);
  if (!upload.ok) {
    if (upload.uploaded.length) await supabase.storage.from(STUDENT_TASK_BUCKET).remove(upload.uploaded);
    return NextResponse.json({ ok: false, error: upload.error }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("student_tasks")
    .insert({ ...validated.value, student_id: session.studentId, attachments: upload.attachments })
    .select("*")
    .single();

  if (error) {
    if (upload.attachments.length) {
      await supabase.storage.from(STUDENT_TASK_BUCKET).remove(upload.attachments.map((a) => a.path));
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, task: data as StudentTaskRow });
}
