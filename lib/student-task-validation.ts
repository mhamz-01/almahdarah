import { validateTaskAttachment } from "@/lib/admin/task-validation";

const SUBJECT_MAX_LENGTH = 60;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 2000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const STUDENT_TASK_MAX_FILES = 5;

export type StudentTaskFieldsResult =
  | { ok: true; value: { subject: string | null; title: string; description: string; due_date: string | null } }
  | { ok: false; error: string };

export function validateStudentTaskFields(body: Record<string, unknown>): StudentTaskFieldsResult {
  if (typeof body.title !== "string" || !body.title.trim()) return { ok: false, error: "Title is required" };
  if (body.title.trim().length > TITLE_MAX_LENGTH) {
    return { ok: false, error: `Title must be ${TITLE_MAX_LENGTH} characters or fewer` };
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  if (subject.length > SUBJECT_MAX_LENGTH) {
    return { ok: false, error: `Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer` };
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer` };
  }

  let dueDate: string | null = null;
  if (typeof body.due_date === "string" && body.due_date.trim()) {
    if (!DATE_PATTERN.test(body.due_date.trim())) return { ok: false, error: "Invalid due date" };
    dueDate = body.due_date.trim();
  }

  return { ok: true, value: { subject: subject || null, title: body.title.trim(), description, due_date: dueDate } };
}

export function validateStudentTaskFiles(files: File[], existingCount: number): string | null {
  if (existingCount + files.length > STUDENT_TASK_MAX_FILES) {
    return `A task can have at most ${STUDENT_TASK_MAX_FILES} files`;
  }
  for (const file of files) {
    const error = validateTaskAttachment(file);
    if (error) return error;
  }
  return null;
}
