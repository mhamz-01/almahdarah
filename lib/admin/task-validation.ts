import type { TaskInsert } from "@/lib/types";

const SUBJECT_MAX_LENGTH = 60;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 2000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const TASK_ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024; // 15MB
export const TASK_ATTACHMENT_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/zip",
];

export type TaskFieldsValidationResult =
  | { ok: true; value: Pick<TaskInsert, "subject" | "title" | "description" | "due_date"> }
  | { ok: false; error: string };

export function validateTaskFields(body: Record<string, unknown>): TaskFieldsValidationResult {
  if (typeof body.subject !== "string" || !body.subject.trim()) {
    return { ok: false, error: "Subject is required" };
  }
  if (body.subject.trim().length > SUBJECT_MAX_LENGTH) {
    return { ok: false, error: `Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer` };
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return { ok: false, error: "Title is required" };
  }
  if (body.title.trim().length > TITLE_MAX_LENGTH) {
    return { ok: false, error: `Title must be ${TITLE_MAX_LENGTH} characters or fewer` };
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer` };
  }

  let dueDate: string | null = null;
  if (typeof body.due_date === "string" && body.due_date.trim()) {
    if (!DATE_PATTERN.test(body.due_date.trim())) {
      return { ok: false, error: "Invalid due date" };
    }
    dueDate = body.due_date.trim();
  }

  return {
    ok: true,
    value: { subject: body.subject.trim(), title: body.title.trim(), description, due_date: dueDate },
  };
}

export function validateTaskAttachment(file: File): string | null {
  if (file.size > TASK_ATTACHMENT_MAX_BYTES) return "Attachment must be 15MB or smaller";
  if (file.type && !TASK_ATTACHMENT_ALLOWED_TYPES.includes(file.type)) {
    return "That file type isn't supported";
  }
  return null;
}
