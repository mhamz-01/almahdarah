import type { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { StudentTaskAttachment } from "@/lib/types";

export const STUDENT_TASK_BUCKET = "student-task-files";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

// Uploads under `<studentId>/…` so one student's files never share a path with another's.
export async function uploadStudentTaskFiles(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  studentId: number,
  files: File[],
): Promise<{ ok: true; attachments: StudentTaskAttachment[] } | { ok: false; error: string; uploaded: string[] }> {
  const attachments: StudentTaskAttachment[] = [];
  for (const file of files) {
    const path = `${studentId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage
      .from(STUDENT_TASK_BUCKET)
      .upload(path, file, { contentType: file.type || undefined });
    if (error) return { ok: false, error: error.message, uploaded: attachments.map((a) => a.path) };
    const { data } = supabase.storage.from(STUDENT_TASK_BUCKET).getPublicUrl(path);
    attachments.push({ url: data.publicUrl, name: file.name, path });
  }
  return { ok: true, attachments };
}

export function formFiles(form: FormData): File[] {
  return form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
}
