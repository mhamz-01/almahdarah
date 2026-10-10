import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// Node-only. Reversible encryption (AES-256-GCM) so the admin panel can show
// a student's password back to the admin. The login itself still verifies the
// scrypt hash (lib/password.ts) — this copy is never used for authentication.
//
// The key is derived from STUDENT_SESSION_SECRET, so rotating that secret
// makes previously stored passwords unreadable (decryptSecret returns null and
// the panel just asks the admin to set a new one).

function key(): Buffer {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) throw new Error("STUDENT_SESSION_SECRET is not set");
  return createHash("sha256").update(`password-vault:${secret}`).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${data.toString("hex")}`;
}

export function decryptSecret(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const [version, ivHex, tagHex, dataHex] = stored.split(":");
    if (version !== "v1" || !ivHex || !tagHex || !dataHex) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
