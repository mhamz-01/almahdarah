import { QUOTE_LIMITS } from "@/lib/admin/quote-limits";
import type { QuoteInsert } from "@/lib/types";

const KINDS = ["quote", "passage"] as const;

export type QuoteValidationResult = { ok: true; value: QuoteInsert } | { ok: false; error: string };

export function validateQuotePayload(body: unknown): QuoteValidationResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  if (typeof b.topic_key !== "string" || !b.topic_key.trim()) {
    return { ok: false, error: "Topic is required" };
  }
  if (b.topic_key.trim().length > QUOTE_LIMITS.topic) {
    return { ok: false, error: `Topic must be ${QUOTE_LIMITS.topic} characters or fewer` };
  }
  if (typeof b.kind !== "string" || !KINDS.includes(b.kind as (typeof KINDS)[number])) {
    return { ok: false, error: "Choose a valid type" };
  }
  if (typeof b.body !== "string" || !b.body.trim()) {
    return { ok: false, error: "Quote text is required" };
  }
  if (b.body.trim().length > QUOTE_LIMITS.body) {
    return { ok: false, error: `Quote text must be ${QUOTE_LIMITS.body} characters or fewer` };
  }
  if (typeof b.author !== "string" || !b.author.trim()) {
    return { ok: false, error: "Author is required" };
  }
  if (b.author.trim().length > QUOTE_LIMITS.author) {
    return { ok: false, error: `Author must be ${QUOTE_LIMITS.author} characters or fewer` };
  }
  if (b.kind === "passage" && (typeof b.title !== "string" || !b.title.trim())) {
    return { ok: false, error: "Title is required for a passage" };
  }
  if (typeof b.title === "string" && b.title.trim().length > QUOTE_LIMITS.title) {
    return { ok: false, error: `Title must be ${QUOTE_LIMITS.title} characters or fewer` };
  }

  return {
    ok: true,
    value: {
      topic_key: b.topic_key.trim(),
      kind: b.kind as QuoteInsert["kind"],
      title: typeof b.title === "string" && b.title.trim() ? b.title.trim() : null,
      body: b.body.trim(),
      author: b.author.trim(),
      published: b.published !== false,
    },
  };
}
