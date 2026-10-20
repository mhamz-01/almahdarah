// Sends email through Resend's REST API (no SDK needed).
//
// Environment:
//   RESEND_API_KEY   API key from resend.com
//   EMAIL_FROM       e.g. "Al-Mahdrah <noreply@yourdomain.com>". The domain must be verified in
//                    Resend before it can email students (until then Resend only delivers to the
//                    account owner, from onboarding@resend.dev).

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";
const BATCH_SIZE = 100;
// Resend allows ~2 requests/second per account; used only when falling back to one-by-one sends.
const SINGLE_SEND_GAP_MS = 600;
const NETWORK_RETRIES = 2;
const NETWORK_RETRY_GAP_MS = 1000;

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  to: string;
  ok: boolean;
  error?: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Public site URL for links inside emails. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

function payload(m: OutgoingEmail) {
  return { from: process.env.EMAIL_FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text };
}

async function errorMessage(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const json = JSON.parse(raw) as { message?: string; error?: string };
    return json.message ?? json.error ?? `Email service error (${res.status})`;
  } catch {
    return `Email service error (${res.status})`;
  }
}

// Node's fetch only says "fetch failed"; the useful part (ENOTFOUND, ETIMEDOUT, ...) is in `cause`.
function networkErrorMessage(e: unknown): string {
  if (!(e instanceof Error)) return "Network error";
  const cause = e.cause as { code?: string; message?: string } | undefined;
  const detail = cause?.code ?? cause?.message;
  return `Couldn't reach the email service (${detail ?? e.message})`;
}

export async function sendOne(message: OutgoingEmail): Promise<SendResult> {
  if (!emailConfigured()) return { to: message.to, ok: false, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM)" };
  let lastError = "Network error";
  // Network failures (DNS hiccup, dropped connection) almost always mean Resend never got the
  // request, so they are retried. An HTTP error response did reach it and is returned straight away.
  for (let attempt = 0; attempt < NETWORK_RETRIES + 1; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, NETWORK_RETRY_GAP_MS * attempt));
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload(message)),
      });
      if (!res.ok) return { to: message.to, ok: false, error: await errorMessage(res) };
      return { to: message.to, ok: true };
    } catch (e) {
      lastError = networkErrorMessage(e);
    }
  }
  return { to: message.to, ok: false, error: lastError };
}

/**
 * Sends many emails with the batch endpoint (100 per request). If a batch is rejected
 * (e.g. one bad address fails validation for the whole batch) its messages are retried one by one,
 * so a single bad address never blocks everyone else.
 */
export async function sendMany(messages: OutgoingEmail[]): Promise<SendResult[]> {
  if (!emailConfigured()) {
    return messages.map((m) => ({ to: m.to, ok: false, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM)" }));
  }
  const results: SendResult[] = [];
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);
    let batchOk = false;
    try {
      const res = await fetch(RESEND_BATCH_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map(payload)),
      });
      batchOk = res.ok;
      if (res.ok) results.push(...chunk.map((m) => ({ to: m.to, ok: true })));
    } catch {
      batchOk = false;
    }
    if (!batchOk) {
      for (const m of chunk) {
        results.push(await sendOne(m));
        await new Promise((r) => setTimeout(r, SINGLE_SEND_GAP_MS));
      }
    }
  }
  return results;
}
