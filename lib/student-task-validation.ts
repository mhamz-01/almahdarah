import { validateTaskAttachment } from "@/lib/admin/task-validation";
import { isValidIsoDate } from "@/lib/task-plan";

const SUBJECT_MAX_LENGTH = 60;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 2000;
export const NOTES_MAX_LENGTH = 2000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const STUDENT_TASK_MAX_FILES = 5;

export type StudentTaskFieldsResult =
  | {
      ok: true;
      value: {
        subject: string | null;
        title: string;
        description: string;
        due_date: string | null;
        planned_date: string | null;
      };
    }
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

  let plannedDate: string | null = null;
  if (typeof body.planned_date === "string" && body.planned_date.trim()) {
    if (!isValidIsoDate(body.planned_date.trim())) return { ok: false, error: "Invalid planned day" };
    plannedDate = body.planned_date.trim();
  }

  return {
    ok: true,
    value: { subject: subject || null, title: body.title.trim(), description, due_date: dueDate, planned_date: plannedDate },
  };
}

export type StudentTaskQuickUpdateResult =
  | { ok: true; value: { completed?: boolean; planned_date?: string | null; notes?: string } }
  | { ok: false; error: string };

// JSON PATCH body: tick/untick (`completed`), move to a day (`planned_date`, null to unplan) and/or save `notes`.
export function validateStudentTaskQuickUpdate(body: unknown): StudentTaskQuickUpdateResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const { completed, planned_date, notes } = body as { completed?: unknown; planned_date?: unknown; notes?: unknown };
  const value: { completed?: boolean; planned_date?: string | null; notes?: string } = {};

  if (completed !== undefined) {
    if (typeof completed !== "boolean") return { ok: false, error: "Invalid request" };
    value.completed = completed;
  }
  if (planned_date !== undefined) {
    if (planned_date !== null && !isValidIsoDate(planned_date)) return { ok: false, error: "Invalid planned day" };
    value.planned_date = planned_date as string | null;
  }
  if (notes !== undefined) {
    if (typeof notes !== "string") return { ok: false, error: "Invalid request" };
    if (notes.trim().length > NOTES_MAX_LENGTH) return { ok: false, error: `Notes must be ${NOTES_MAX_LENGTH} characters or fewer` };
    value.notes = notes.trim();
  }
  if (!Object.keys(value).length) return { ok: false, error: "Nothing to update" };
  return { ok: true, value };
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
