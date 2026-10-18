import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/get-student-session";
import { STUDENT_TASK_BUCKET } from "@/lib/student-task-files";
import { STUDENT_TASK_MAX_FILES } from "@/lib/student-task-validation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createUploadTarget, parseFileMeta, type UploadTarget } from "@/lib/upload-targets";

// Returns signed upload slots (inside this student's own folder) so the browser can
// send files straight to Supabase Storage instead of through this API.
export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { files?: unknown } | null;
  const metas = Array.isArray(body?.files) ? body.files.map(parseFileMeta) : [];
  if (!metas.length || metas.length > STUDENT_TASK_MAX_FILES || metas.some((m) => !m)) {
    return NextResponse.json({ ok: false, error: "Invalid upload request" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const targets: UploadTarget[] = [];
  for (const meta of metas) {
    const result = await createUploadTarget(supabase, STUDENT_TASK_BUCKET, `${session.studentId}/`, meta!);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    targets.push(result.target);
  }
  return NextResponse.json({ ok: true, targets });
}
