import type { StudentInsert } from "@/lib/types";

const NAME_MAX_LENGTH = 80;
const USERNAME_MAX_LENGTH = 40;
const LEVEL_MAX_LENGTH = 40;
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_AVATAR_COLOR = "#1182A3";

export type StudentValidationResult = { ok: true; value: StudentInsert } | { ok: false; error: string };

export function validateStudentPayload(body: unknown): StudentValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || !b.name.trim()) {
    return { ok: false, error: "Name is required" };
  }
  if (b.name.trim().length > NAME_MAX_LENGTH) {
    return { ok: false, error: `Name must be ${NAME_MAX_LENGTH} characters or fewer` };
  }

  if (typeof b.username !== "string" || !b.username.trim()) {
    return { ok: false, error: "Username is required" };
  }
  const username = b.username.trim().toLowerCase();
  if (username.length > USERNAME_MAX_LENGTH) {
    return { ok: false, error: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer` };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, error: "Username can only contain letters, numbers, dots, underscores and hyphens" };
  }

  if (typeof b.level !== "string" || !b.level.trim()) {
    return { ok: false, error: "Level is required" };
  }
  if (b.level.trim().length > LEVEL_MAX_LENGTH) {
    return { ok: false, error: `Level must be ${LEVEL_MAX_LENGTH} characters or fewer` };
  }

  const avatarColor = typeof b.avatar_color === "string" && COLOR_PATTERN.test(b.avatar_color)
    ? b.avatar_color
    : DEFAULT_AVATAR_COLOR;

  return {
    ok: true,
    value: {
      name: b.name.trim(),
      username,
      level: b.level.trim(),
      avatar_color: avatarColor,
    },
  };
}
