// Validation for the student's email settings (PATCH /api/student/email-prefs).

export interface EmailPrefsUpdate {
  weekly_digest?: boolean;
  plan_reminder?: boolean;
  /** ISO weekdays, 1 = Monday ... 7 = Sunday; sorted and unique. */
  reminder_days?: number[];
  email?: string;
}

export type EmailPrefsResult = { ok: true; value: EmailPrefsUpdate } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_MAX_LENGTH = 254;

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

export function validateEmailPrefs(body: unknown): EmailPrefsResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request" };
  const { weekly_digest, plan_reminder, reminder_days, email } = body as Record<string, unknown>;
  const value: EmailPrefsUpdate = {};

  if (weekly_digest !== undefined) {
    if (typeof weekly_digest !== "boolean") return { ok: false, error: "Invalid request" };
    value.weekly_digest = weekly_digest;
  }
  if (plan_reminder !== undefined) {
    if (typeof plan_reminder !== "boolean") return { ok: false, error: "Invalid request" };
    value.plan_reminder = plan_reminder;
  }
  if (reminder_days !== undefined) {
    if (!Array.isArray(reminder_days) || reminder_days.some((d) => !Number.isInteger(d) || d < 1 || d > 7)) {
      return { ok: false, error: "Choose days between Monday and Sunday" };
    }
    value.reminder_days = [...new Set(reminder_days as number[])].sort((a, b) => a - b);
  }
  if (email !== undefined) {
    if (typeof email !== "string") return { ok: false, error: "Invalid email address" };
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) return { ok: false, error: "Enter a valid email address" };
    value.email = trimmed;
  }

  if (!Object.keys(value).length) return { ok: false, error: "Nothing to update" };
  return { ok: true, value };
}
