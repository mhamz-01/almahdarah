// Student portal session tokens. A real JWT (HS256) so it's a standard,
// inspectable format — signed/verified with Web Crypto (crypto.subtle) so
// this module works unmodified in both the edge middleware and regular
// Node route handlers/server components.
//
// Deliberately separate from lib/admin-auth.ts: a leaked student secret
// should never let anyone forge an admin session, or vice versa.

export const STUDENT_SESSION_COOKIE = "student_session";
export const STUDENT_SESSION_TTL_SECONDS = 20 * 24 * 60 * 60; // 20 days

export interface StudentSessionPayload {
  studentId: number;
  username: string;
}

function requireSecret(): string {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) throw new Error("STUDENT_SESSION_SECRET is not set");
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeJson(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(signingInput: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createStudentSessionToken(studentId: number, username: string): Promise<string> {
  const secret = requireSecret();
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    sub: String(studentId),
    username,
    iat: now,
    exp: now + STUDENT_SESSION_TTL_SECONDS,
  });
  const signingInput = `${header}.${payload}`;
  const signature = await sign(signingInput, secret);
  return `${signingInput}.${signature}`;
}

export async function verifyStudentSessionToken(token: string | undefined | null): Promise<StudentSessionPayload | null> {
  if (!token) return null;
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;

  let expectedSignature: string;
  try {
    expectedSignature = await sign(`${headerPart}.${payloadPart}`, secret);
  } catch {
    return null;
  }
  if (expectedSignature.length !== signaturePart.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    mismatch |= expectedSignature.charCodeAt(i) ^ signaturePart.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payload = decodeJson<{ sub: string; username: string; iat: number; exp: number }>(payloadPart);
    if (typeof payload.exp !== "number" || Math.floor(Date.now() / 1000) > payload.exp) return null;
    const studentId = Number(payload.sub);
    if (!Number.isInteger(studentId)) return null;
    return { studentId, username: payload.username };
  } catch {
    return null;
  }
}
