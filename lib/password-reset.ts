import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

// Node-only. Pure helpers and limits for the student "Forgot password?" flow
// (app/api/student/password-reset/*). Nothing here touches the database, so
// it can be unit-tested directly.

export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 10 * 60 * 1000; // a code works for 10 minutes
export const MAX_CODE_ATTEMPTS = 5; // wrong guesses before a code is dead
export const RESEND_COOLDOWN_MS = 60 * 1000; // one code per email per minute
export const MAX_CODES_PER_EMAIL_PER_HOUR = 5;
export const MAX_REQUESTS_PER_IP_PER_HOUR = 15;
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // time to pick a new password after verifying

function secret(): string {
  const value = process.env.STUDENT_SESSION_SECRET;
  if (!value) throw new Error("STUDENT_SESSION_SECRET is not set");
  return value;
}

export function generateCode(): string {
  return String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
}

// Keyed with a server secret, so a leaked table can't be brute-forced offline
// (a 6-digit code has only a million possibilities). Bound to the email so a
// hash can't be replayed against another row.
export function hashCode(email: string, code: string): string {
  return createHmac("sha256", `password-reset:${secret()}`).update(`${email}:${code}`).digest("hex");
}

export function codeMatches(email: string, code: string, storedHash: string): boolean {
  const a = Buffer.from(hashCode(email, code), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Digits only, so pasting "123 456" or "123-456" still works. Null when it can't be a code. */
export function normalizeCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return digits.length === CODE_LENGTH ? digits : null;
}

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isExpired(iso: string, now = Date.now()): boolean {
  return new Date(iso).getTime() <= now;
}

export function resetTokenExpired(verifiedAtIso: string, now = Date.now()): boolean {
  return new Date(verifiedAtIso).getTime() + RESET_TOKEN_TTL_MS <= now;
}

/** Best-effort client IP for rate limiting (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || null;
}

export interface RecentRequests {
  emailLastAt: string | null;
  emailLastHour: number;
  ipLastHour: number;
}

/** Null when a new code may be issued, otherwise the reason it can't. */
export function rateLimitError(recent: RecentRequests, now = Date.now()): string | null {
  if (recent.ipLastHour >= MAX_REQUESTS_PER_IP_PER_HOUR || recent.emailLastHour >= MAX_CODES_PER_EMAIL_PER_HOUR) {
    return "Too many reset requests. Please try again in an hour.";
  }
  if (recent.emailLastAt && now - new Date(recent.emailLastAt).getTime() < RESEND_COOLDOWN_MS) {
    return "A code was just sent. Please wait a minute before asking for another.";
  }
  return null;
}
