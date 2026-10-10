import type { StudentInsert } from "@/lib/types";

const NAME_MAX_LENGTH = 80;
const USERNAME_MAX_LENGTH = 40;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 72;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{6,19}$/;
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_AVATAR_COLOR = "#1182A3";

export function validateName(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) return { ok: false, error: "Name is required" };
  if (value.trim().length > NAME_MAX_LENGTH) {
    return { ok: false, error: `Name must be ${NAME_MAX_LENGTH} characters or fewer` };
  }
  return { ok: true, value: value.trim() };
}

export function validateUsername(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) return { ok: false, error: "Username is required" };
  const username = value.trim().toLowerCase();
  if (username.length > USERNAME_MAX_LENGTH) {
    return { ok: false, error: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer` };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, error: "Username can only contain letters, numbers, dots, underscores and hyphens" };
  }
  return { ok: true, value: username };
}

export function validateEmail(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) return { ok: false, error: "Email is required" };
  const email = value.trim().toLowerCase();
  if (email.length > 120 || !EMAIL_PATTERN.test(email)) return { ok: false, error: "Enter a valid email address" };
  return { ok: true, value: email };
}

export function validatePhone(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value.trim()) return { ok: false, error: "Mobile number is required" };
  const phone = value.trim();
  if (!PHONE_PATTERN.test(phone)) {
    return { ok: false, error: "Enter a valid mobile number, e.g. +44 7700 900123" };
  }
  return { ok: true, value: phone };
}

export function validatePassword(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || !value) return { ok: false, error: "Password is required" };
  if (value.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer` };
  }
  return { ok: true, value };
}

export type StudentValidationResult =
  | { ok: true; value: StudentInsert & { password: string } }
  | { ok: false; error: string };

// Admin "Add student": name, username, and an admin-chosen password.
export function validateStudentPayload(body: unknown): StudentValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  const name = validateName(b.name);
  if (!name.ok) return name;
  const username = validateUsername(b.username);
  if (!username.ok) return username;
  const password = validatePassword(b.password);
  if (!password.ok) return password;

  const avatarColor =
    typeof b.avatar_color === "string" && COLOR_PATTERN.test(b.avatar_color) ? b.avatar_color : DEFAULT_AVATAR_COLOR;

  return {
    ok: true,
    value: { name: name.value, username: username.value, avatar_color: avatarColor, password: password.value },
  };
}
