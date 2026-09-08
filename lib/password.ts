import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Node-only (uses node:crypto's scrypt) — import this from route handlers,
// never from middleware or other edge-runtime code.

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hashHex] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hashHex) return false;
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  const storedKey = Buffer.from(hashHex, "hex");
  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
}

// Excludes visually ambiguous characters (0/O, 1/l/I) since this is read
// off a screen by an admin and typed in by a student.
const PASSWORD_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generatePassword(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARSET[bytes[i] % PASSWORD_CHARSET.length];
  }
  return out;
}
